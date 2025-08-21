const path = require('node:path');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");
const { deleteFileById, isAlphanumeric } = require('../utils/utils');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { supabase, bucketName } = require('../config/supabase');

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(`uploads/${fileName}`, file.buffer, {
        contentType: file.mimetype,
      });
    if (error) return res.status(500).send(error);
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`uploads/${fileName}`);
    res.send(`File uploaded to ${publicUrlData.publicUrl}`);
    const { parentId } = req.body
    await prisma.file.create({
      data: {
        name: file.originalname,
        size: req.file.size,
        folderId: Number(parentId),
        accessUrl: `${publicUrlData.publicUrl}`,
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
    await prisma.file.update({
      where: {
        id: Number(fileId),
      },
      data: {
        name: name
      },
    })
    res.redirect(`/file/${fileId}`); // go back to file details
  }
]

async function getDeleteFile(req, res) {
  try {
    const fileId = req.params.fileId;
    deleteFileById(fileId);
    res.redirect('/folder/1');
  } catch (err) {
    console.log('Delete error: ', err);
    return res.status(500).send('Internal server error');
  }
}

module.exports = {
  getUpload,
  postUpload,
  getFile,
  getUpdateFile,
  postUpdateFile,
  getDeleteFile
}