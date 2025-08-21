const { isAuth } = require('../middleware/authMiddleware');
const { Router } = require('express');
const fileController = require('../controllers/fileController');

const fileRouter = Router();

fileRouter.get('/upload', isAuth, fileController.getUpload);
fileRouter.post('/upload', isAuth, fileController.postUpload);
fileRouter.get('/:fileId/edit', isAuth, fileController.getUpdateFile);
fileRouter.post('/:fileId/edit', isAuth, fileController.postUpdateFile);
fileRouter.get('/:fileId', isAuth, fileController.getFile);

module.exports = fileRouter;