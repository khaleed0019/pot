import cloudinaryRoot from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import createCloudinaryStorage from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import type { Request } from 'express';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = createCloudinaryStorage({
  cloudinary: cloudinaryRoot as { v2: typeof cloudinary },
  params: async (req: Request, file: Express.Multer.File) => {
    return {
      folder: 'property-on-set',
      format: 'jpeg',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage: storage });

export default upload;
