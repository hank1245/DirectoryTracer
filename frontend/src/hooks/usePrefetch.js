import { useCallback } from "react";

/**
 * usePrefetch
 * Provide stable prefetch callbacks for one or more dynamic importers.
 * Each importer should be a function: () => import('...')
 */
export function usePrefetch(importers) {
  return useCallback(() => {
    if (!Array.isArray(importers)) return;
    for (const importer of importers) {
      try {
        const fn = typeof importer === "function" ? importer : null;
        if (fn) fn();
      } catch {
        // ignore prefetch errors
      }
    }
  }, [importers]);
}
