/**
 * Serializes a JSON-LD object for safe use in dangerouslySetInnerHTML.
 *
 * `JSON.stringify` does not escape `/`, so a string value containing the
 * literal sequence `</script>` closes the tag early and lets anything after
 * it run as HTML/script — a classic stored-XSS vector. This matters here
 * because several JSON-LD blocks embed agent-controlled listing data
 * (title, description, address), not just developer-written text, so it's
 * exploitable by anyone who can create or edit a listing, not just repo
 * committers. Escaping `<` to its unicode form neutralizes `</script>`,
 * `<script>`, and `<!--` alike while staying valid, semantically identical
 * JSON — browsers unescape `<` back to `<` when parsing the string.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
