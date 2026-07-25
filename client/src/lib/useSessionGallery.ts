import { useCallback, useEffect, useState } from "react";
import type { ReferenceAsset } from "./types";

const STORAGE_KEY = "ugc-style-master:session-gallery";
const MAX_ITEMS = 24;

export function useSessionGallery() {
  const [items, setItems] = useState<ReferenceAsset[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ReferenceAsset[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or unavailable — session gallery just won't persist
    }
  }, [items]);

  const addItem = useCallback((asset: ReferenceAsset) => {
    setItems((prev) => {
      const deduped = prev.filter((item) => item.src !== asset.src);
      return [asset, ...deduped].slice(0, MAX_ITEMS);
    });
  }, []);

  const removeItem = useCallback((src: string) => {
    setItems((prev) => prev.filter((item) => item.src !== src));
  }, []);

  return { items, addItem, removeItem };
}
