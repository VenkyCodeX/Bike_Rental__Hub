const express = require('express');
const multer  = require('multer');
const path    = require('path');
const { protect, adminOnly } = require('../middleware/auth');
const router  = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../assets/uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'bike-' + Date.now() + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/upload
router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ url: `assets/uploads/${req.file.filename}` });
});

module.exports = router;
