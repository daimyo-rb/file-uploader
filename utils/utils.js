const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { supabase, bucketName } = require('../config/supabase');

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

function extractStoragePath(url) {
  const parts = url.split(`${bucketName}/`);
  return parts[1];
}

async function deleteFileById(id) {
  const file = await prisma.file.findUnique({
  select: {
      accessUrl: true,
    },
    where: {
      id: Number(id),
    }
  });
  if (!file) {
    console.log('no file found');
    throw new Error('file not found');
  }
  const storagePath = extractStoragePath(file.accessUrl);
  const { error: supabaseError } = await supabase.storage
    .from(bucketName)
    .remove([storagePath]);
  if (supabaseError) {
    console.error('Supabase delete error:', supabaseError);
    throw new Error('Failed to delete from storage');
  }
  await prisma.file.delete({
    where: {
      id: Number(id),
    },
  })
}

module.exports = {
  isAlphanumeric,
  doesFolderWithIdExist,
  extractStoragePath,
  deleteFileById
}