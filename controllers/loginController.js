const passport = require('passport');

function getLogin(req, res) {
  res.render('login');
}

const postLogin = [
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
  })
]

module.exports = {
  getLogin,
  postLogin
}