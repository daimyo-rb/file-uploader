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

module.exports = {
  getFolder
}