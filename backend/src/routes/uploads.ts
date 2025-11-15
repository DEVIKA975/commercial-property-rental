import { Router } from 'express';
import multer from 'multer';
const upload = multer({ dest: '/tmp/uploads' });
const router = Router();

router.post('/', upload.array('images', 6), (req, res) => {
  // In production, upload to Cloudinary/S3. Here we return local filenames.
  const files = (req as any).files || [];
  const urls = files.map((f: any) => `/uploads/${f.filename}`);
  res.json({ urls });
});

export default router;
