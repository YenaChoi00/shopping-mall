const { User } = require('../models/User');

let auth = (req, res, next) => {
  let token = req.cookies.w_auth;           // 쿠키 속에 담긴 토큰을 이용하여

  User.findByToken(token, (err, user) => {  // user의 정보를 가져온다.
    if (err) throw err;
    if (!user)
      return res.json({
        isAuth: false,
        error: true
      });

    req.token = token;
    req.user = user;    // 모든 user정보가 req.user에 담겨서, 라우터에서 req.use를 사용하여 그 정보들을 사용할 수 있는 것
    next();
  });
};

module.exports = { auth };
