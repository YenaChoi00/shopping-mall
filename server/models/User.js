const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const moment = require("moment");

const userSchema = mongoose.Schema({
    name: {
        type:String,
        maxlength:50
    },
    email: {
        type:String,
        trim:true,
        unique: 1 
    },
    password: {
        type: String,
        minglength: 5
    },
    lastname: {
        type:String,
        maxlength: 50
    },
    role : {
        type:Number,
        default: 0 
    },
    cart:{  // 현재 장바구니 정보임
        type: Array,
        default: []
    },
    history: {  // 구매 내역 등
        type: Array,
        default: []
    },
    image: String,
    token : {
        type: String,
    },
    tokenExp :{
        type: Number
    }
})


userSchema.pre('save', function( next ) {
    var user = this;
    
    if(user.isModified('password')){    
        // console.log('password changed')
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);
    
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash 
                next()
            })
        })
    } else {
        next()
    }
});

userSchema.methods.comparePassword = function(plainPassword,cb){
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if (err) return cb(err);
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;
    console.log('user',user)
    console.log('userSchema', userSchema)
    var token =  jwt.sign(user._id.toHexString(),'secret')
    var oneHour = moment().add(1, 'hour').valueOf();

    user.tokenExp = oneHour;
    user.token = token;
    user.save(function (err, user){
        if(err) return cb(err)
        cb(null, user);
    })
}

userSchema.statics.findByToken = function (token, cb) {         // auth 기능 중 토큰 인증 시 사용
    var user = this;

    // token을 decode한다.
    jwt.verify(token,'secret',function(err, decode){
        // 유저 아이디를 이용해서 유저를 찾은 다음
        // client에서 가져온 token과 DB에 보관된 token이 일치하는지 확인
        user.findOne({"_id":decode, "token":token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mongoose.model('User', userSchema);

module.exports = { User }