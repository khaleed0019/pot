import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Parent folder also has package-lock.json; pin root so PostCSS/Tailwind resolve correctly.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
