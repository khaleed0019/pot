declare module 'multer-storage-cloudinary' {
  import type { Request } from 'express';
  import type { StorageEngine } from 'multer';

  function createCloudinaryStorage(options: {
    cloudinary: { v2: { uploader: unknown } };
    params?: (
      req: Request,
      file: Express.Multer.File
    ) => Record<string, unknown> | Promise<Record<string, unknown>>;
    [key: string]: unknown;
  }): StorageEngine;

  export default createCloudinaryStorage;
}
