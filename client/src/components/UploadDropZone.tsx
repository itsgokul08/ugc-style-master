import { useRef, useState, type ReactNode } from "react";
import { X, Images } from "lucide-react";
import type { ReferenceAsset } from "../lib/types";

type Props = {
  label: string;
  description: string;
  asset: ReferenceAsset | null;
  isUploading: boolean;
  onFiles: (files: FileList) => void;
  onPickFromGallery: () => void;
  onRemove: () => void;
  children: ReactNode; // icon shown in the empty state
  compact?: boolean;
};

export function UploadDropZone({
  label,
  description,
  asset,
  isUploading,
  onFiles,
  onPickFromGallery,
  onRemove,
  children,
  compact = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-200">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {asset ? (
        <div className="group relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <img
            src={asset.src}
            alt={asset.name}
            className={compact ? "h-16 w-16 rounded-lg object-cover" : "h-20 w-20 rounded-lg object-cover"}
          />
          <button
            onClick={onRemove}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
            aria-label="Remove"
          >
            <X size={14} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-gray-200">{asset.name}</p>
            <p className="text-xs text-gray-500">Ready</p>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
          >
            Change
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            isDragOver ? "border-lime-400 bg-lime-400/5" : "border-white/15 bg-white/[0.02]"
          }`}
        >
          <div className="mb-2 text-gray-500">{children}</div>
          <p className="mb-1 text-xs text-gray-500">{description}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-gray-200 hover:bg-white/10 disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Click to upload"}
            </button>
            <span className="text-xs text-gray-600">or</span>
            <button
              onClick={onPickFromGallery}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-lime-400 hover:bg-lime-400/10"
            >
              <Images size={14} />
              From gallery
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600">Drag &amp; drop or paste an image</p>
        </div>
      )}
    </div>
  );
}
