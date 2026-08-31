import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import type { Request, RequestHandler } from 'express';

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

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// `multer-storage-cloudinary` (the package this used to route uploads
// through) predates the Cloudinary v2 SDK this project has installed, and is
// incompatible with it: its storage engine's _handleFile never invokes its
// callback against the current SDK, so every upload just hung forever with
// no error and no response — confirmed by calling it directly with a real
// file stream and watching it never resolve, while calling the Cloudinary
// SDK itself with the same file succeeded in ~2s. Buffering in memory with
// plain multer and uploading through the current SDK ourselves (below)
// avoids that unmaintained middleware entirely.
//
// No limits previously — any authenticated user could upload arbitrarily
// large or non-image files (up to 12 per request per the route's
// .array('images', 12)), an easy cost/storage abuse vector against
// Cloudinary. 8MB comfortably covers real photos; reject everything else
// by MIME type before it ever reaches Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
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

function uploadBufferToCloudinary(buffer: Buffer, originalname: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'property-on-set',
        format: 'jpeg',
        public_id: `${Date.now()}-${originalname.split('.')[0]}`,
      },
      (error, result) => {
        if (error || !result) {
          reject(error instanceof Error ? error : new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Wraps a multer memory-storage middleware (e.g. `upload.single('x')` or
 * `upload.array('x', 12)`): once multer has buffered the file(s) in memory,
 * this uploads each to Cloudinary and overwrites `.path` with the resulting
 * secure_url — the same field every controller here already reads — so
 * nothing downstream needs to change to pick up the real upload.
 */
export function withCloudinaryUpload(middleware: RequestHandler): RequestHandler {
  return (req: Request, res, next) => {
    middleware(req, res, (err?: unknown) => {
      if (err) {
        next(err);
        return;
      }
      const files: Express.Multer.File[] = req.file
        ? [req.file]
        : Array.isArray(req.files)
          ? req.files
          : [];
      if (files.length === 0) {
        next();
        return;
      }
      Promise.all(
        files.map(async (file) => {
          const url = await uploadBufferToCloudinary(file.buffer, file.originalname);
          (file as unknown as { path: string }).path = url;
        })
      )
        .then(() => next())
        .catch(next);
    });
  };
}

export default upload;
