const { Router } = require('express');
const folderController = require('../controllers/folderController');

const folderRouter = Router();

folderRouter.get('/create-folder', folderController.getCreateFolder);
folderRouter.post('/create-folder', folderController.postCreateFolder);
folderRouter.get('/:folderId/edit', folderController.getUpdateFolder);
folderRouter.post('/:folderId/edit', folderController.postUpdateFolder);
folderRouter.get('/:folderId/delete', folderController.getDeleteFolder);
folderRouter.get('/:folderId', folderController.getFolder);

module.exports = folderRouter;