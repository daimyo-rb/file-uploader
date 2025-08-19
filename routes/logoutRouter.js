const { Router } = require('express');
const logoutController = require('../controllers/logoutController');

const logoutRouter = Router();

logoutRouter.get('/', logoutController.getLogout);

module.exports = logoutRouter;