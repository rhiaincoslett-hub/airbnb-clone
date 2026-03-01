const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { uploadImages } = require('../controllers/uploadController');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const allowedMimes = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/gif', 'image/webp'];
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = allowedMimes.includes(file.mimetype) || (file.mimetype && file.mimetype.startsWith('image/'));
    if (ok) cb(null, true);
    else cb(new Error('Invalid file type'), false);
  },
});

router.post('/', auth, (req, res, next) => {
  upload.array('images', 12)(req, res, (err) => {
    if (err) {
      if (err.message === 'Invalid file type') {
        return res.status(400).json({ message: 'Only images (JPEG, PNG, GIF, WebP) are allowed' });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large (max 5MB)' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Unexpected field. Use the "images" field for file uploads.' });
      }
      console.error('Upload multer error:', err.code || err.message, err);
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    Promise.resolve(uploadImages(req, res)).catch(next);
  });
});

module.exports = router;
