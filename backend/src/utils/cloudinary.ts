import cloudinaryRoot from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import createCloudinaryStorage from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import type { Request } from 'express';

dotenv.config();

// The only Cloudinary var this project actually sets (in .env / render.yaml) is
// the combined CLOUDINARY_URL. The SDK *can* auto-parse that from process.env on
// import, but only if it's already set by the time the `cloudinary` package first
// loads — which isn't guaranteed given this app's import order. Parsing it
// ourselves and passing the three fields explicitly avoids that fragility, and
// previously this call passed CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET — vars
// that were never defined anywhere — which overwrote any auto-parsed config with
// `undefined`, silently breaking every image upload.
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (cloudinaryUrl) {
  try {
    const parsed = new URL(cloudinaryUrl);
    cloudinary.config({
      cloud_name: parsed.hostname,
      api_key: parsed.username,
      api_secret: parsed.password,
    });
  } catch {
    console.warn('CLOUDINARY_URL is set but not a valid cloudinary://key:secret@cloud_name URL');
  }
} else {
  console.warn('CLOUDINARY_URL not set — image uploads will fail');
}

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

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const upload = multer({
  storage,
  // No limits previously — any authenticated user could upload arbitrarily
  // large or non-image files (up to 12 per request per the route's
  // .array('images', 12)), an easy cost/storage abuse vector against
  // Cloudinary. 8MB comfortably covers real photos; reject everything else
  // by MIME type before it ever reaches Cloudinary.
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    // `expose` marks this safe to show verbatim to the client — see the
    // global error handler in index.ts, which otherwise replaces every
    // error message with a generic one.
    const err = Object.assign(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed'), {
      status: 400,
      expose: true,
    });
    cb(err);
  },
});

export default upload;
