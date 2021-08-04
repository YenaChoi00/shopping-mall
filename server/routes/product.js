const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Product } = require('../models/Product');

//=================================
//             Product
//=================================
var storage = multer.diskStorage({
    destination: function (req, file, cb) { // 어디에 파일이 저장되는지
      cb(null, 'uploads/')                  // uploads 폴더 아래에 저장된다.
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`)
    }
  })
   
var upload = multer({ storage: storage }).single("file")

router.post('/image', (req, res) =>{
    // client가 보내서 받은 이미지 저장
    upload(req, res, err => {
        if(err){
            return req.json({ success: false, err})
        }
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename})
    })
})

router.post('/', (req, res) =>{   // index.js에서 이 파일로 라우팅해줬기 때문에 루트로만 적음(원래:/api/product)
    // 받아온 정보 DB에 넣어준다.
    const product = new Product(req.body)
    product.save((err)=>{
      if(err) return res.status(400).json({ success: false, err})
      return res.status(200).json({ success: true })
    })

})

router.post('/products', (req, res) => {
    // product collection(DB)에 들어있는 모든 상품 정보를 가져오기

    let limit = req.body.limit ? parseInt(req.body.limit): 20;  // LandingPage.js의 body로 받은 정보
    let skip = req.body.skip ? parseInt(req.body.skip): 0;

    // 데이터 가져올 때. 선택된 필터 조건이 2번째 check box면 findArgs = { continets: [ 2 ] }
    let findArgs = {};

    for (let key in req.body.filters){        // key는 continents 혹은 price(어떤 필터인지)

      if(req.body.filters[key].length > 0){   // 하나 이상 들어있으면
        
        console.log("key:", key)
        
        if(key === "price"){
          findArgs[key] = {
            $gte: req.body.filters[key][0],   // grater than equal. 몽고db에서 사용하는 것
            $lte: req.body.filters[key][1]    // less than equal.
          }
        } else{
          findArgs[key] = req.body.filters[key];
        }
      }
    }

    console.log("findArgs", findArgs)

    Product.find(findArgs)  
      .populate("writer")
      .skip(skip)                             // 몽고db에 알려주는 것
      .limit(limit)
      .exec((err, productInfo) => { 
        if(err) return res.status(400).json({ success: false, err})
        return res.status(200).json({ 
            success: true, productInfo,
            postSize: productInfo.length })
      })
})

// 상품 상세 정보
router.get('/products_by_id', (req, res) =>{ 
    
  let type = req.query.type               // req.body 대신 req.query   
  let productIds = req.query.id

  if(type === "array"){
    // id = 121212, 23232, 344532..로 받아온 것을
    // productIds = ['121212', '23232', '344532'] 로 바꾸는 작업
    let ids = req.query.id.split(',')
    productIds = ids.map(item => {
      return item
    })
  }

  // productId(clinet에서 보낸 prop)를 이용하여 DB에서 productId와 같은 상품의 정보를 가져온다.
  Product.find({_id: {$in: productIds}})   // 상세 페이지 처럼 하나만 오는거면 {_id: productIds} 하면 됨
    .populate('writer')
    .exec((err, product) => {
      if(err) return res.status(400).send(err)
      return res.status(200).send(product)
    })
})




module.exports = router;
