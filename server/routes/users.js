const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { Product } = require("../models/Product");
const { auth } = require("../middleware/auth");
const { Payment } = require("../models/Payment");
const async = require('async');


//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
        cart: req.user.cart,
        history: req.user.history
    });
});

router.post("/register", (req, res) => {

    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        });
    });
});

router.post("/login", (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user)
            return res.json({
                loginSuccess: false,
                message: "Auth failed, email not found"
            });

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "Wrong password" });

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie("w_authExp", user.tokenExp);
                res
                    .cookie("w_auth", user.token)
                    .status(200)
                    .json({
                        loginSuccess: true, userId: user._id
                    });
            });
        });
    });
});

router.get("/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
});

router.post("/addToCart", auth, (req, res) => {
    // user collection에서 해당 유저의 정보를 가져오기
    User.findOne({_id: req.user._id},
        (err, userInfo) => {
        // 가져온 정보에서 카트에 넣으려는 상품이 이미 들어있는지 확인
        let duplicate = false
        userInfo.cart.forEach((item) => {
            if(item.id === req.body.productId){
                duplicate = true
            }
        })

        //상품이 이미 있을 때
        if (duplicate) {
            User.findOneAndUpdate(
                { _id: req.user._id, "cart.id": req.body.productId },
                { $inc: { "cart.$.quantity": 1 } },         //$inc 는 하나 증가하는 메소드
                { new: true },
                (err, userInfo) => {
                    if (err) return res.status(200).json({ success: false, err })
                    res.status(200).send(userInfo.cart)
                }
            )
        }
        //상품이 이미 있지 않을 때. (원래 추가 기능)
        else {
            User.findOneAndUpdate(
                { _id: req.user._id },
                {
                    $push: {
                        cart: {
                            id: req.body.productId,
                            quantity: 1,
                            date: Date.now()
                        }
                    }
                },
                { new: true },      // update된 data 보내줌
                (err, userInfo) => {
                    if (err) return res.status(400).json({ success: false, err })
                    res.status(200).send(userInfo.cart)
                }
            )
        }
    })
});


router.get('/removeFromCart', auth, (req, res)=>{
    // cart안에 지우려고 한 상품을 지워주기
    User.findOneAndUpdate(
        {_id: req.user._id},
        {
            "$pull": 
                {"cart": {"id": req.query.id}}
        },
        {new: true},
        (err, userInfo) => {
            let cart = userInfo.cart
            let array = cart.map(item => {
                return item.id
            })
        // product Collection에서 현재 남아있는 상품들의 정보, cartDetail 다시 가져오기


            // id = 121212, 23232, 344532..로 받아온 것을
            // productIds = ['121212', '23232', '344532'] 로 바꾸는 작업
            Product.find({ _id: { $in: array } })
            .populate('writer')
            .exec((err, productInfo) => {
                return res.status(200).json({
                    productInfo,
                    cart
                })
            })
        
        }
    )
})

router.post('/successBuy', auth, (req, res)=>{
    // 1. User collection 안에 History 필드 안에 간단한 결제 정보 넣어주기
    let historyArr = [];
    let transactionData = {};

    req.body.cartDetail.forEach((item) => {     // cartDetail은 CartPage에서 액션의 props로 보내준 것
        historyArr.push({
            dateOfPurchase: Date.now(),
            name: item.title,
            id: item._id,
            price: item.price,
            quantity: item.quantity,
            paymentId: req.body.paymentData.paymentID // patmentData라는 이름으로 CartPage에서 액션의 props로 보내준 것
        })
    })

    // 2. Payment collection 안에 자세한 결제 정보 넣어주기
    // 미들웨어를 통해 들어온 정보들이라 req.user 이렇게.. 
    transactionData.user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
    }

    transactionData.data = req.body.paymentData
    transactionData.product = historyArr


    User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { history: historyArr }, $set: { cart: [] } },     // 카트 비워주기($set)
        { new: true },
        (err, user) => {
            if (err) return res.json({ success: false, err })

            //payment에다가  transactionData정보 저장 
            const payment = new Payment(transactionData)
            payment.save((err, doc) => {
                if (err) return res.json({ success: false, err })


                //3. Product Collection 안에 있는 sold 필드 정보 업데이트 시켜주기 

                //상품 당 몇개의 quantity를 샀는지 
                let products = [];
                doc.product.forEach(item => {
                    products.push({ id: item.id, quantity: item.quantity })
                })

                // 상품 정보 중, sold 필드 업데이트
                // 결제 성공한 모든 product의 sold를 업뎃해야 하는데, for문은 복잡하므로 async 사용
                async.eachSeries(products, (item, callback) => {

                    Product.update(
                        { _id: item.id },
                        {
                            $inc: {
                                "sold": item.quantity           // 팔린 갯수만큼 sold 업데이트
                            }
                        },
                        { new: false },
                        callback
                    )
                }, (err) => {
                    if (err) return res.status(400).json({ success: false, err })
                    res.status(200).json({
                        success: true,
                        cart: user.cart,
                        cartDetail: []
                    })
                }
                )
            })
        }
    )

})


module.exports = router;
