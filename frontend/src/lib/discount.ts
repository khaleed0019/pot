/** Whole-number % off, or null if there's no active discount (no originalPrice, or it isn't actually higher than price). */
export function discountPercent(price?: number | null, originalPrice?: number | null): number | null {
  if (!price || !originalPrice || originalPrice <= price) return null;
  return Math.round((1 - price / originalPrice) * 100);
}
