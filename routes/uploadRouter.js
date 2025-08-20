const { Router } = require('express');
const uploadController = require('../controllers/uploadController');

const uploadRouter = Router();

uploadRouter.get('/', uploadController.getUpload);
uploadRouter.post('/', uploadController.postUpload);

module.exports = uploadRouter;