const { isAuth } = require('../middleware/authMiddleware');
const { Router } = require('express');
const folderController = require('../controllers/folderController');

const folderRouter = Router();

folderRouter.get('/create-folder', isAuth, folderController.getCreateFolder);
folderRouter.post('/create-folder', isAuth, folderController.postCreateFolder);
folderRouter.get('/:folderId/edit', isAuth, folderController.getUpdateFolder);
folderRouter.post('/:folderId/edit', isAuth, folderController.postUpdateFolder);
folderRouter.get('/:folderId/delete', isAuth, folderController.getDeleteFolder);
folderRouter.get('/:folderId', folderController.getFolder);

module.exports = folderRouter;