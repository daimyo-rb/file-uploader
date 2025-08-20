const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

function getSignUp(req, res) {
  res.render('sign-up');
}

const postSignUp = [
  body('username').trim()
    .isLength({ min: 1, max: 50 }).withMessage('Username name must be between 1 and 50 characters.')
    .custom(async (value) => {
      // update check
      const user = await prisma.user.findUnique({
        where: {
          username: value,
        },
      })
      if (user) {
        throw new Error('username already in use');
      }
    }),
  body('password').trim()
    .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters.')
    .custom((value) => {
      if (!/\d/.test(value)) {
        throw new Error('Password must contain at least one number.');
      }
      return true;
    }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('sign-up', {errors: errors.array()});
    }
    const { username, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    // update create
    await prisma.user.create({
      data: {
        username: username,
        password: password_hash,
      },
    })
    res.redirect('/');
  }
]

module.exports = {
  getSignUp,
  postSignUp
}