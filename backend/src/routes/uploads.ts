import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

const upload = multer();
const router = Router();

cloudinary.config({ url: process.env.CLOUDINARY_URL });

router.post('/', upload.array('images', 6), async (req, res) => {
  const files = (req as any).files || [];
  const uploadPromises = files.map((f: any) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'commercial' }, (error, result) => {
      if (error) return reject(error);
      resolve(result?.secure_url);
    });
    streamifier.createReadStream(f.buffer).pipe(stream);
  }));
  try {
    const urls = await Promise.all(uploadPromises);
    res.json({ urls });
  } catch (e) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
