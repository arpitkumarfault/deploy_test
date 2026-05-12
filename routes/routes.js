import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    console.log('incoming file =>', file);
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage });

router.get('/home', (req, res) => {
  res.render('index');
});

// multers upload 
router.post('/upload', (req, res) => {
  upload.single('file')(req, res, function (err) {
    if (err) {
      console.log('MULTER ERROR:', err);
      return res.status(500).send(err.message);
    }
    console.log('BODY =>', req.body);
    console.log('FILE =>', req.file);

    if (!req.file) {
      return res.status(400).send('No file uploaded. Check input name and form enctype.');
    }

    res.send(`
      <h2>File uploaded successfully</h2>
      <p>${req.file.filename}</p>
      <img src="/uploads/${req.file.filename}" width="200" />
    `);
  });
});

// cloudinary uploads 
router.post('/uploadcloudinary', upload.single('file'), async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const localFilePath = req.file.path;

    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      folder: 'myclouduploads'
    });

    console.log('Cloudinary response:', uploadResult);

    return res.send(`
      <h2>File uploaded successfully to Cloudinary</h2>
      <p>Local file: ${req.file.filename}</p>
      <p>Cloudinary URL: <a href="${uploadResult.secure_url}" target="_blank">${uploadResult.secure_url}</a></p>
      <img src="${uploadResult.secure_url}" width="250" />
    `);
  } catch (error) {
    console.log('Cloudinary upload error:', error);
    return res.status(500).send(error.message);
  }
});

export default router;