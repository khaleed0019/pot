/** @type {import('postcss-load-config').Config} */
// Use string plugin id so PostCSS loads this via Node require (works with `next dev/build --webpack`).
// Turbopack’s PostCSS worker often can’t resolve `@tailwindcss/postcss` in Docker.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
