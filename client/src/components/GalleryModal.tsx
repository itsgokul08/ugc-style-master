import { X } from "lucide-react";
import type { ReferenceAsset } from "../lib/types";

type Props = {
  open: boolean;
  items: ReferenceAsset[];
  onClose: () => void;
  onSelect: (asset: ReferenceAsset) => void;
};

export function GalleryModal({ open, items, onClose, onSelect }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#101116] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-100">Pick from this session's uploads</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-gray-200">
            <X size={18} />
          </button>
        </div>
        {items.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">
            Nothing uploaded yet this session. Upload a reference, outfit, or location photo and it'll show up here for reuse.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {items.map((asset) => (
              <button
                key={asset.src}
                onClick={() => onSelect(asset)}
                className="group relative aspect-square overflow-hidden rounded-lg border border-white/10"
              >
                <img src={asset.src} alt={asset.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium text-transparent transition-colors group-hover:bg-black/50 group-hover:text-white">
                  Select
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
