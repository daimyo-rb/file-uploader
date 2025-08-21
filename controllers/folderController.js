const { body, validationResult } = require("express-validator");
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function getFolder(req, res) {
  const folderId = Number(req.params.folderId);
  const folder = await prisma.folder.findUnique({
    where: {
      id: folderId,
    },
    include: {
      childFolders: true,
      childFiles: true,
    },
  })
  if (!folder) {
    return res.render('folder', {
      id: 1,
      errors: [{ msg: 'Invalid folder ID' }],
    });
  }
  res.render('folder', {
    id: folderId,
    folder,
    childFolders: folder.childFolders,
    childFiles: folder.childFiles,
  });
}

async function getCreateFolder(req, res) {
  const parentId = Number(req.query.parentId) || 1;
  const parent = await prisma.folder.findUnique({
    where: {
      id: parentId,
    },
  })
  if (!parent) {
    return res.render('create-folder', {
      parentId: 1,
      name: 'root',
      errors: [{msg: 'parent not found. using root'}],
    })
  }
  res.render('create-folder', { parentId: parent.id, name: parent.name });
}

function isAlphanumeric(value) {
  if (/[^a-zA-Z0-9]/.test(value)) {
    throw new Error('Folder name must contain only letters and numbers.');
  }
  return true;
}

async function doesFolderWithIdExist(id) {
  const folder = await prisma.folder.findUnique({
    where: {
      id: Number(id)
    },
  })
  if (!folder) {
    throw new Error('parent folder does not exist');
  }
  return true;
}

const postCreateFolder = [
  body('parentId').trim()
    .custom(doesFolderWithIdExist), // make sure parent exists
  body('name').trim()
    .isLength({ min: 1, max: 100 }).withMessage('Folder name must be between 1 and 100 characters.')
    .custom(isAlphanumeric),
  async (req, res) => {
    const errors = validationResult(req);
    const { parentId, name, oldName } = req.body;
    if (!errors.isEmpty()) {
      return res.render(`create-folder`,
        { errors: errors.array(), parentId, name: oldName, oldName }
      );
    }
    await prisma.folder.create({
      data: {
        name: name,
        parentId: Number(parentId),
      },
    })
    res.redirect(`/folder/${parentId}`);
  }
]

async function getUpdateFolder(req, res) {
  const folderId = req.params.folderId;
  const folder = await prisma.folder.findUnique({
    where: {
      id: Number(folderId),
    },
  })
  if (!folder) {
    return res.render('/folder/1', {
      errors: [{msg: 'folder not found'}],
    })
  }
  res.render('update-folder', { folderId, name: folder.name, oldName: folder.name });
}

const postUpdateFolder = [
  body('folderId').trim()
    .custom(doesFolderWithIdExist),
  body('name').trim()
    .isLength({ min: 1, max: 100 }).withMessage('Folder name must be between 1 and 100 characters.')
    .custom(isAlphanumeric),
  async (req, res) => {
    const errors = validationResult(req);
    const { folderId, name, oldName } = req.body;
    if (!errors.isEmpty()) {
      return res.render('update-folder',
        { errors: errors.array(), folderId, name: oldName, oldName }
      );
    }
    await prisma.folder.update({
      where: {
        id: Number(folderId),
      },
      data: {
        name: name,
      },
    })
    res.redirect(`/folder/${folderId}`);
  }
]

module.exports = {
  getFolder,
  getCreateFolder,
  postCreateFolder,
  getUpdateFolder,
  postUpdateFolder
}