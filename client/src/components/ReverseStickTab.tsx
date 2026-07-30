import { useCallback, useState } from "react";
import { Shirt, ScanSearch, ScanFace, SlidersHorizontal } from "lucide-react";
import { UploadDropZone } from "./UploadDropZone";
import { GalleryModal } from "./GalleryModal";
import { PromptCard } from "./PromptCard";
import { Toggle } from "./Toggle";
import { useSessionGallery } from "../lib/useSessionGallery";
import { fileToDataUrl, generateReversePrompt } from "../lib/api";
import { BODY_WEIGHT_OPTIONS, BOOBS_OPTIONS } from "../lib/constants";
import type { BodyWeight, BoobsSize, PickerTarget, ReferenceAsset } from "../lib/types";

export function ReverseStickTab() {
  const [baseRef, setBaseRef] = useState<ReferenceAsset | null>(null);
  const [faceRef, setFaceRef] = useState<ReferenceAsset | null>(null);
  const [outfitRef, setOutfitRef] = useState<ReferenceAsset | null>(null);
  const [isUploadingBase, setIsUploadingBase] = useState(false);
  const [isUploadingFace, setIsUploadingFace] = useState(false);
  const [isUploadingOutfit, setIsUploadingOutfit] = useState(false);

  const [sexyMode, setSexyMode] = useState(false);
  const [ageRange, setAgeRange] = useState(25);
  const [bodyWeight, setBodyWeight] = useState<BodyWeight>("average");
  const [boobsSize, setBoobsSize] = useState<BoobsSize>("medium");

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>("base");

  const gallery = useSessionGallery();

  const setForTarget = useCallback((target: PickerTarget, asset: ReferenceAsset) => {
    if (target === "base") setBaseRef(asset);
    else if (target === "face") setFaceRef(asset);
    else if (target === "outfit") setOutfitRef(asset);
  }, []);

  const UPLOADING_SETTERS = {
    base: setIsUploadingBase,
    face: setIsUploadingFace,
    outfit: setIsUploadingOutfit,
  } as const;

  const handleFiles = useCallback(
    async (files: FileList, target: "base" | "face" | "outfit") => {
      const file = files[0];
      if (!file) return;
      const setUploading = UPLOADING_SETTERS[target];
      setUploading(true);
      setError("");
      try {
        const src = await fileToDataUrl(file);
        const asset: ReferenceAsset = { name: file.name, type: "image/jpeg", src };
        setForTarget(target, asset);
        gallery.addItem(asset);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't process that image.");
      } finally {
        setUploading(false);
      }
    },
    [setForTarget, gallery]
  );

  function openGalleryPicker(target: PickerTarget) {
    setPickerTarget(target);
    setShowGalleryModal(true);
  }

  function handleSelectFromGallery(asset: ReferenceAsset) {
    setForTarget(pickerTarget, asset);
    setShowGalleryModal(false);
  }

  async function handleGenerate() {
    if (!baseRef) return;
    setError("");
    setLoading(true);
    try {
      const v = await generateReversePrompt({
        baseImage: baseRef.src,
        faceImage: faceRef?.src,
        outfitImage: outfitRef?.src,
        sexyMode,
        ageRange,
        bodyWeight,
        boobsSize,
      });
      setPrompt(v.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong reverse-engineering the prompt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl md:p-6">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <UploadDropZone
              label="Base image"
              description="The AI image to reverse-engineer"
              asset={baseRef}
              isUploading={isUploadingBase}
              onFiles={(files) => handleFiles(files, "base")}
              onPickFromGallery={() => openGalleryPicker("base")}
              onRemove={() => setBaseRef(null)}
              showPasteButton
              compact
            >
              <ScanSearch size={24} />
            </UploadDropZone>
            <UploadDropZone
              label="Face reference"
              description="Optional — use this face & hair color instead"
              asset={faceRef}
              isUploading={isUploadingFace}
              onFiles={(files) => handleFiles(files, "face")}
              onPickFromGallery={() => openGalleryPicker("face")}
              onRemove={() => setFaceRef(null)}
              showPasteButton
              compact
            >
              <ScanFace size={24} />
            </UploadDropZone>
            <UploadDropZone
              label="Outfit reference"
              description="Optional — describe this outfit instead"
              asset={outfitRef}
              isUploading={isUploadingOutfit}
              onFiles={(files) => handleFiles(files, "outfit")}
              onPickFromGallery={() => openGalleryPicker("outfit")}
              onRemove={() => setOutfitRef(null)}
              showPasteButton
              compact
            >
              <Shirt size={24} />
            </UploadDropZone>
          </div>

          <div className="rounded-xl border border-white/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-300">
              <SlidersHorizontal size={16} />
              Body adjustments
            </div>

            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>Age</span>
                <span className="text-gray-300">{ageRange}</span>
              </div>
              <input
                type="range"
                min={18}
                max={60}
                value={ageRange}
                onChange={(e) => setAgeRange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1.5 text-xs text-gray-500">Body weight</p>
                <div className="flex flex-col gap-1.5">
                  {BODY_WEIGHT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBodyWeight(opt.value)}
                      className={`rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                        bodyWeight === opt.value
                          ? "border-lime-400 bg-lime-400/10 text-lime-300"
                          : "border-white/10 text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-gray-500">Chest size</p>
                <div className="flex flex-col gap-1.5">
                  {BOOBS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBoobsSize(opt.value)}
                      className={`rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                        boobsSize === opt.value
                          ? "border-lime-400 bg-lime-400/10 text-lime-300"
                          : "border-white/10 text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
              sexyMode ? "border-pink-400/40" : "border-white/10"
            }`}
          >
            <div>
              <p className="text-sm text-gray-200">Sexy look</p>
              <p className="text-xs text-gray-500">More revealing outfit, tasteful and sensual</p>
            </div>
            <Toggle checked={sexyMode} onChange={setSexyMode} accent="pink" />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <PromptCard
            title="Reverse-engineered prompt"
            subtitle="Cinematography, color grade, film type — concise"
            prompt={prompt}
            loading={loading}
            onGenerate={handleGenerate}
            disabled={!baseRef || loading}
            disabledReason="Add a base image first"
          />
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-gray-600">{gallery.items.length} uploaded this session</p>

      <GalleryModal
        open={showGalleryModal}
        items={gallery.items}
        onClose={() => setShowGalleryModal(false)}
        onSelect={handleSelectFromGallery}
      />
    </>
  );
}
