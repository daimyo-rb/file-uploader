const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

function isAlphanumeric(value) {
  if (/[^a-zA-Z0-9.]/.test(value)) {
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

module.exports = {
  isAlphanumeric,
  doesFolderWithIdExist
}