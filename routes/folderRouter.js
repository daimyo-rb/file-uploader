const { Router } = require('express');
const folderController = require('../controllers/folderController');

const folderRouter = Router();

folderRouter.get('/:folderId', folderController.getFolder);

module.exports = folderRouter;