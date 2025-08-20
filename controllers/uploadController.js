const path = require('node:path');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '../uploads') });

function getUpload(req, res) {
  res.render('upload');
}

const postUpload = [
  upload.single('uploadedFile'),
  function (req, res) {
    res.render('index');
  }
]

module.exports = {
  getUpload,
  postUpload
}