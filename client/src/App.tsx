import { useCallback, useEffect, useMemo, useState } from "react";
import { Shirt, Mountain, SlidersHorizontal, ImagePlus } from "lucide-react";
import { UploadDropZone } from "./components/UploadDropZone";
import { GalleryModal } from "./components/GalleryModal";
import { PromptCard } from "./components/PromptCard";
import { useSessionGallery } from "./lib/useSessionGallery";
import { fileToDataUrl, generateCharacterSheetPrompt, generateEnvironmentPrompt, generateUgcPrompt } from "./lib/api";
import { BODY_WEIGHT_OPTIONS, BOOBS_OPTIONS, SCENE_PRESETS } from "./lib/constants";
import type { AspectRatio, BodyWeight, BoobsSize, PickerTarget, ReferenceAsset } from "./lib/types";

export default function App() {
  const [reference, setReference] = useState<ReferenceAsset | null>(null);
  const [outfitRef, setOutfitRef] = useState<ReferenceAsset | null>(null);
  const [locationRef, setLocationRef] = useState<ReferenceAsset | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingOutfit, setIsUploadingOutfit] = useState(false);
  const [isUploadingLocation, setIsUploadingLocation] = useState(false);

  const [sceneDescription, setSceneDescription] = useState(SCENE_PRESETS[0].description);
  const [activePreset, setActivePreset] = useState(SCENE_PRESETS[0].id);
  const [customInstructions, setCustomInstructions] = useState("");
  const [aspectRatio] = useState<AspectRatio>("9:16");

  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [characterSheetPrompt, setCharacterSheetPrompt] = useState("");
  const [environmentPrompt, setEnvironmentPrompt] = useState("");
  const [loadingUgc, setLoadingUgc] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [loadingEnv, setLoadingEnv] = useState(false);
  const [error, setError] = useState("");

  const [useFaceRef, setUseFaceRef] = useState(true);
  const [sexyMode, setSexyMode] = useState(false);
  const [ageRange, setAgeRange] = useState(25);
  const [bodyWeight, setBodyWeight] = useState<BodyWeight>("average");
  const [boobsSize, setBoobsSize] = useState<BoobsSize>("medium");

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>("reference");

  const gallery = useSessionGallery();

  const setForTarget = useCallback((target: PickerTarget, asset: ReferenceAsset) => {
    if (target === "reference") setReference(asset);
    else if (target === "outfit") setOutfitRef(asset);
    else setLocationRef(asset);
  }, []);

  const handleFiles = useCallback(
    async (files: FileList, target: PickerTarget) => {
      const file = files[0];
      if (!file) return;
      const setUploading = target === "reference" ? setIsUploading : target === "outfit" ? setIsUploadingOutfit : setIsUploadingLocation;
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

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      if (reference) return; // only auto-fill the reference slot, and only while empty
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      const file = item?.getAsFile();
      if (file) {
        const dt = new DataTransfer();
        dt.items.add(file);
        handleFiles(dt.files, "reference");
      }
    }
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [reference, handleFiles]);

  function openGalleryPicker(target: PickerTarget) {
    setPickerTarget(target);
    setShowGalleryModal(true);
  }

  function handleSelectFromGallery(asset: ReferenceAsset) {
    setForTarget(pickerTarget, asset);
    setShowGalleryModal(false);
  }

  function applyPreset(preset: (typeof SCENE_PRESETS)[number]) {
    setActivePreset(preset.id);
    setSceneDescription(preset.description);
  }

  async function handleGenerateUgc() {
    if (!reference) return;
    setError("");
    setLoadingUgc(true);
    try {
      const v = await generateUgcPrompt({
        referenceImage: reference.src,
        outfitImage: outfitRef?.src,
        locationImage: locationRef?.src,
        sceneDescription,
        aspectRatio,
        sexyMode,
        customInstructions: customInstructions || undefined,
        ageRange,
        bodyWeight,
        boobsSize,
      });
      setGeneratedPrompt(v.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong generating the UGC prompt.");
    } finally {
      setLoadingUgc(false);
    }
  }

  async function handleGenerateCharacterSheet() {
    if (!reference) return;
    setError("");
    setLoadingSheet(true);
    try {
      const v = await generateCharacterSheetPrompt({
        referenceImage: reference.src,
        outfitImage: outfitRef?.src,
        locationImage: locationRef?.src,
        sexyMode,
        ageRange,
        bodyWeight,
        boobsSize,
      });
      setCharacterSheetPrompt(v.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong generating the character sheet prompt.");
    } finally {
      setLoadingSheet(false);
    }
  }

  async function handleGenerateEnvironment() {
    setError("");
    setLoadingEnv(true);
    try {
      const v = await generateEnvironmentPrompt({
        sceneDescription,
        aspectRatio: "16:9",
        locationImage: locationRef?.src,
      });
      setEnvironmentPrompt(v.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong generating the environment prompt.");
    } finally {
      setLoadingEnv(false);
    }
  }

  const galleryButtonHint = useMemo(() => `${gallery.items.length} uploaded this session`, [gallery.items.length]);

  return (
    <div className="min-h-dvh bg-[#0b0c10] text-gray-100">
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(circle at 50% -10%, rgba(163,230,53,0.08), transparent 60%)" }}
      />
      <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-50">UGC Style Master</h1>
          <p className="text-sm text-gray-500">Generate UGC, character sheet, and environment prompts</p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl md:p-6">
          {/* Step 1 */}
          <section className="mb-6">
            <p className="mb-3 text-sm font-medium text-gray-300">Step 1 — Reference photo</p>
            <UploadDropZone
              label=""
              description="Click to upload, drag & drop, or paste"
              asset={reference}
              isUploading={isUploading}
              onFiles={(files) => handleFiles(files, "reference")}
              onPickFromGallery={() => openGalleryPicker("reference")}
              onRemove={() => setReference(null)}
            >
              <Mountain size={28} />
            </UploadDropZone>
          </section>

          {/* Step 2 */}
          <section className="space-y-5">
            <p className="text-sm font-medium text-gray-300">Step 2 — Scene &amp; prompts</p>

            <div className="flex flex-wrap gap-2">
              {SCENE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    activePreset === preset.id
                      ? "border-lime-400 bg-lime-400/10 text-lime-300"
                      : "border-white/10 text-gray-400 hover:bg-white/5"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Scene description</label>
              <textarea
                rows={2}
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2.5 text-sm text-gray-200 outline-none focus:border-lime-400/50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-500">Custom instructions (optional)</label>
              <textarea
                rows={2}
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Anything else the prompt should include..."
                className="w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2.5 text-sm text-gray-200 outline-none focus:border-lime-400/50"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <UploadDropZone
                label="Outfit reference"
                description="Optional — match this clothing"
                asset={outfitRef}
                isUploading={isUploadingOutfit}
                onFiles={(files) => handleFiles(files, "outfit")}
                onPickFromGallery={() => openGalleryPicker("outfit")}
                onRemove={() => setOutfitRef(null)}
                compact
              >
                <Shirt size={24} />
              </UploadDropZone>
              <UploadDropZone
                label="Location reference"
                description="Optional — match this setting"
                asset={locationRef}
                isUploading={isUploadingLocation}
                onFiles={(files) => handleFiles(files, "location")}
                onPickFromGallery={() => openGalleryPicker("location")}
                onRemove={() => setLocationRef(null)}
                compact
              >
                <ImagePlus size={24} />
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

              <div className="mb-4">
                <p className="mb-1.5 text-xs text-gray-500">Body weight</p>
                <div className="flex gap-2">
                  {BODY_WEIGHT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBodyWeight(opt.value)}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
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
                <div className="flex gap-2">
                  {BOOBS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBoobsSize(opt.value)}
                      className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
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

            <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
              <div>
                <p className="text-sm text-gray-200">Use face reference</p>
                <p className="text-xs text-gray-500">Preserve the identity from the reference photo</p>
              </div>
              <Toggle checked={useFaceRef} onChange={setUseFaceRef} />
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

            <div>
              <p className="mb-2 text-xs text-gray-500">
                Each card generates independently — only pay for the prompt types you actually need.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <PromptCard
                  title="Regular"
                  subtitle="UGC photo prompt"
                  prompt={generatedPrompt}
                  loading={loadingUgc}
                  onGenerate={handleGenerateUgc}
                  disabled={!reference || loadingUgc}
                  disabledReason="Add a reference photo first"
                />
                <PromptCard
                  title="Character sheet"
                  subtitle="Front / back / close-up, gray studio"
                  prompt={characterSheetPrompt}
                  loading={loadingSheet}
                  onGenerate={handleGenerateCharacterSheet}
                  disabled={!reference || loadingSheet}
                  disabledReason="Add a reference photo first"
                />
                <PromptCard
                  title="Environment"
                  subtitle="Establishing shot, no people"
                  prompt={environmentPrompt}
                  loading={loadingEnv}
                  onGenerate={handleGenerateEnvironment}
                  disabled={loadingEnv}
                />
              </div>
            </div>
          </section>
        </div>

        <p className="mt-3 text-center text-xs text-gray-600">{galleryButtonHint}</p>
      </div>

      <GalleryModal
        open={showGalleryModal}
        items={gallery.items}
        onClose={() => setShowGalleryModal(false)}
        onSelect={handleSelectFromGallery}
      />
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  accent = "lime",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  accent?: "lime" | "pink";
}) {
  const activeColor = accent === "pink" ? "bg-pink-500" : "bg-lime-400";
  const activeText = accent === "pink" ? "text-pink-400" : "text-lime-400";
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex shrink-0 items-center gap-2"
    >
      <span className={`text-xs font-medium tabular-nums ${checked ? activeText : "text-gray-500"}`}>
        {checked ? "On" : "Off"}
      </span>
      <span
        className={`flex h-6 w-11 items-center rounded-full border p-0.5 transition-colors ${
          checked ? `${activeColor} border-transparent justify-end` : "border-white/20 bg-white/5 justify-start"
        }`}
      >
        <span className="h-5 w-5 shrink-0 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}
