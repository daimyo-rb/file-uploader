const path = require('node:path');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { doesFolderWithIdExist} = require('../utils/utils');
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

module.exports = {
  getUpload,
  postUpload
}