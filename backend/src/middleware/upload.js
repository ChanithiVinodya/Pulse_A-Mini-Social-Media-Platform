const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { AppError } = require('./errorHandler');

const UPLOAD_DIRS = {
  avatar: 'avatars',
  image: 'posts',
  story: 'stories',
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = UPLOAD_DIRS[file.fieldname] || 'posts';
    const dir = path.join(__dirname, '..', '..', 'uploads', subfolder);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed (jpeg, png, webp, gif)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const getPublicUrl = (file, fieldname) => {
  if (!file) return null;
  const subfolder = UPLOAD_DIRS[fieldname] || 'posts';
  return `/uploads/${subfolder}/${file.filename}`;
};

module.exports = { upload, getPublicUrl };
