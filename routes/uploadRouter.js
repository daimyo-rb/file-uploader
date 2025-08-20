const { isAuth } = require('../middleware/authMiddleware');
const { Router } = require('express');
const uploadController = require('../controllers/uploadController');

const uploadRouter = Router();

uploadRouter.get('/', isAuth, uploadController.getUpload);
uploadRouter.post('/', isAuth, uploadController.postUpload);

module.exports = uploadRouter;