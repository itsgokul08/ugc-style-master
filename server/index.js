import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import {
  UGC_SYSTEM_PROMPT,
  CHARACTER_SHEET_SYSTEM_PROMPT,
  ENVIRONMENT_SYSTEM_PROMPT,
  REVERSE_ENGINEER_SYSTEM_PROMPT,
} from "./prompts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "../client/dist");

const PORT = process.env.PORT || 8787;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY. Copy .env.example to .env and set your key.");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

function dataUrlToImageBlock(dataUrl) {
  const match = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/.exec(dataUrl || "");
  if (!match) return null;
  const [, mediaType, data] = match;
  return { type: "image", source: { type: "base64", media_type: mediaType, data } };
}

function pushLabeledImage(content, label, dataUrl) {
  const block = dataUrlToImageBlock(dataUrl);
  if (!block) return;
  content.push({ type: "text", text: label });
  content.push(block);
}

// Raw slider values ("curvy", "large") on their own are too weak a signal for the
// model to visibly commit to over a real reference photo. Expanding them into a
// vivid physical description gives it something concrete to actually render.
const BODY_WEIGHT_DESCRIPTIONS = {
  slim: "slim build — slender frame, narrow waist and hips, minimal body fat, long lean limbs",
  average: "average build — natural, everyday proportions, neither slim nor heavy",
  athletic: "athletic build — toned and fit, visible muscle definition in arms/legs/core, broader shoulders relative to waist",
  curvy: "curvy build — noticeably fuller hips and thighs, a pronounced waist-to-hip curve, soft rounded silhouette",
};

const BOOBS_SIZE_DESCRIPTIONS = {
  flat: "flat chest — minimal bust, straight torso line",
  small: "small chest — modest, petite bust",
  medium: "medium chest — average, proportionate bust",
  large: "large chest — noticeably full, prominent bust",
};

function bodyLines(ageRange, bodyWeight, boobsSize) {
  return [
    `Depict this person's age as: ${ageRange}`,
    `Depict this person's body as having a ${BODY_WEIGHT_DESCRIPTIONS[bodyWeight] || bodyWeight} — this description takes priority over the reference photo if it differs, and the difference should be clearly visible, not subtle`,
    `Depict this person's chest as having a ${BOOBS_SIZE_DESCRIPTIONS[boobsSize] || boobsSize} — this description takes priority over the reference photo if it differs, and the difference should be clearly visible, not subtle`,
  ];
}

function sceneLine(sceneDescription, locationImage, fallback) {
  const hasText = sceneDescription && sceneDescription.trim().length > 0;
  if (hasText) return `Scene description: ${sceneDescription}`;
  if (locationImage) return "Scene description: none provided — build the scene entirely from the location reference image above.";
  return `Scene description: ${fallback}`;
}

async function generatePrompt(systemPrompt, content) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1300,
    system: systemPrompt,
    messages: [{ role: "user", content }],
  });
  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text.trim() : "";
}

app.post("/api/generate/ugc", async (req, res) => {
  try {
    const {
      referenceImage,
      outfitImage,
      locationImage,
      poseImage,
      sceneDescription,
      aspectRatio = "9:16",
      sexyMode = false,
      customInstructions,
      ageRange = 25,
      bodyWeight = "average",
      boobsSize = "medium",
    } = req.body;

    if (!referenceImage) return res.status(400).json({ ok: false, error: "referenceImage is required" });

    const content = [];
    pushLabeledImage(content, "Reference photo (identity and face to preserve exactly; body adjusted per parameters below):", referenceImage);
    pushLabeledImage(content, "Outfit reference (match this clothing style):", outfitImage);
    pushLabeledImage(content, "Location reference (match this setting):", locationImage);
    pushLabeledImage(
      content,
      "Pose reference (match ONLY the body pose, camera angle, distance, and framing shown in this image — ignore its clothing, setting, background, and the identity of any person in it):",
      poseImage
    );

    const lines = [
      sceneLine(sceneDescription, locationImage, "candid everyday moment"),
      `Aspect ratio: ${aspectRatio} (${aspectRatio === "9:16" ? "vertical phone framing" : aspectRatio === "16:9" ? "horizontal framing" : "square framing"})`,
      ...bodyLines(ageRange, bodyWeight, boobsSize),
      `Sexy mode: ${sexyMode ? "ON — apply sexy mode instructions" : "off"}`,
    ];
    if (customInstructions) lines.push(`Custom instructions: ${customInstructions}`);
    content.push({ type: "text", text: lines.join("\n") });

    const prompt = await generatePrompt(UGC_SYSTEM_PROMPT, content);
    res.json({ ok: true, value: { prompt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/generate/character-sheet", async (req, res) => {
  try {
    const {
      referenceImage,
      outfitImage,
      locationImage,
      sexyMode = false,
      ageRange = 25,
      bodyWeight = "average",
      boobsSize = "medium",
    } = req.body;
    if (!referenceImage) return res.status(400).json({ ok: false, error: "referenceImage is required" });

    const content = [];
    pushLabeledImage(content, "Reference photo (identity/face to preserve):", referenceImage);
    pushLabeledImage(content, "Outfit reference (character MUST wear this outfit, not the one in the face photo):", outfitImage);
    pushLabeledImage(content, "Location/style reference (optional mood reference only):", locationImage);
    content.push({
      type: "text",
      text: [
        "Generate the 3-panel character reference sheet prompt.",
        ...bodyLines(ageRange, bodyWeight, boobsSize),
        `Sexy mode: ${sexyMode ? "ON — apply sexy mode instructions" : "off"}`,
      ].join("\n"),
    });

    const prompt = await generatePrompt(CHARACTER_SHEET_SYSTEM_PROMPT, content);
    res.json({ ok: true, value: { prompt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/generate/environment", async (req, res) => {
  try {
    const { sceneDescription, aspectRatio = "16:9", locationImage } = req.body;

    const content = [];
    pushLabeledImage(content, "Location reference (match this setting):", locationImage);
    content.push({
      type: "text",
      text: `${sceneLine(sceneDescription, locationImage, "an everyday setting")}\nAspect ratio: ${aspectRatio}`,
    });

    const prompt = await generatePrompt(ENVIRONMENT_SYSTEM_PROMPT, content);
    res.json({ ok: true, value: { prompt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/api/generate/reverse", async (req, res) => {
  try {
    const {
      baseImage,
      faceImage,
      outfitImage,
      sexyMode = false,
      ageRange = 25,
      bodyWeight = "average",
      boobsSize = "medium",
    } = req.body;

    if (!baseImage) return res.status(400).json({ ok: false, error: "baseImage is required" });

    const content = [];
    pushLabeledImage(content, "Base image (reverse-engineer the prompt that could have generated this image):", baseImage);
    pushLabeledImage(
      content,
      "Face reference (take facial identity, hair color, and hair texture from THIS image instead of the base image — ignore its pose, hairstyle, outfit, and setting):",
      faceImage
    );
    pushLabeledImage(content, "Outfit reference (describe THIS outfit instead of the base image's outfit):", outfitImage);
    content.push({
      type: "text",
      text: [...bodyLines(ageRange, bodyWeight, boobsSize), `Sexy mode: ${sexyMode ? "ON — apply sexy mode instructions" : "off"}`].join(
        "\n"
      ),
    });

    const prompt = await generatePrompt(REVERSE_ENGINEER_SYSTEM_PROMPT, content);
    res.json({ ok: true, value: { prompt } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Serve the built client (npm run build) and hand any non-API route to it,
// so this one server is the whole deployed app.
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`UGC Style Master server listening on http://localhost:${PORT}`);
});
