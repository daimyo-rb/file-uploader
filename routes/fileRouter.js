const { isAuth } = require('../middleware/authMiddleware');
const { Router } = require('express');
const fileController = require('../controllers/fileController');

const fileRouter = Router();

fileRouter.get('/upload', isAuth, fileController.getUpload);
fileRouter.post('/upload', isAuth, fileController.postUpload);

module.exports = fileRouter;