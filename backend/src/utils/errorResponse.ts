import { Response } from 'express';

/**
 * Log the real error server-side and return a generic message to the client.
 *
 * Internal failure details (database hostnames, connection strings, absolute
 * file paths, SQL fragments) must never reach the client. Returning
 * `error.message` verbatim previously surfaced the full Prisma/Supabase
 * connection error — including the DB host and a local source path — in the
 * browser for any unauthenticated visitor.
 */
export function sendServerError(res: Response, context: string, error: unknown): void {
  console.error(`[${context}]`, error);
  res.status(500).json({ message: 'Something went wrong. Please try again later.' });
}
