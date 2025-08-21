const path = require('node:path');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");
const { isAlphanumeric, doesFolderWithIdExist} = require('../utils/utils');
const multer = require('multer');

const upload = multer({
  dest: path.join(__dirname, '../uploads'),
  fileFiler: (req, file, cb) => {
    const parentId = req.body.parentId;
    if (!doesFolderWithIdExist(parentId)) {
      return cb(new errorMonitor('Invalid parent folder'));
    }
    cb(null, true);
  }
});

async function getUpload(req, res) {
  const parentId = Number(req.query.parentId) || 1;
  const parent = await prisma.folder.findUnique({
    where: {
      id: parentId,
    },
  })
  if (!parent) {
    return res.render('folder', {
      errors: [{ msg: 'Invalid folder ID' }],
    });
  }
  res.render('upload', { parentName: parent.name, parentId });
}

const postUpload = [
  upload.single('uploadedFile'), // upload to filesystem
  async function (req, res) {
    const { parentId } = req.body
    await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        folderId: Number(parentId),
        accessUrl: `/uploads/${req.file.filename}`,
      },
    })
    res.redirect(`/folder/${parentId}`);
  }
]

async function getFile(req, res) {
  const fileId = req.params.fileId;
  const file = await prisma.file.findUnique({
    where: {
      id: Number(fileId),
    },
  })
  res.render('file', { file });
}

async function getUpdateFile(req, res) {
  const id = req.params.fileId;
  const file = await prisma.file.findUnique({
    where: {
      id: Number(id),
    },
  })
  if (!file) {
    res.redirect('/folder/1');
  }
  res.render('update-file', { file, oldName: file.name });
}

const postUpdateFile = [
  body('name').trim()
    .isLength({ min: 1, max: 100 }).withMessage('File name must be between 1 and 100 characters.')
    .custom(isAlphanumeric),
  async (req, res) => {
    const fileId = req.params.fileId;
    const errors = validationResult(req);
    const { name, oldName } = req.body;
    if (!errors.isEmpty()) {
      return res.render('update-file',
        { errors: errors.array(), file: { name: oldName, id: fileId }, oldName }
      );
    }
    // update file
    await prisma.file.update({
      where: {
        id: Number(fileId),
      },
      data: {
        name: req.body.name
      },
    })
    // go back to details of file
    res.redirect(`/file/${fileId}`);
  }
]

async function getDeleteFile(req, res) {
  await prisma.file.delete({
    where: {
      id: Number(req.params.fileId),
    },
  })
  res.redirect('/folder/1');
}

module.exports = {
  getUpload,
  postUpload,
  getFile,
  getUpdateFile,
  postUpdateFile,
  getDeleteFile
}