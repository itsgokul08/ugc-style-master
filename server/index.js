import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { UGC_SYSTEM_PROMPT, CHARACTER_SHEET_SYSTEM_PROMPT, ENVIRONMENT_SYSTEM_PROMPT } from "./prompts.js";

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

    const lines = [
      `Scene description: ${sceneDescription || "candid everyday moment"}`,
      `Aspect ratio: ${aspectRatio} (${aspectRatio === "9:16" ? "vertical phone framing" : aspectRatio === "16:9" ? "horizontal framing" : "square framing"})`,
      `Depict this person's age as: ${ageRange}`,
      `Depict this person's body weight/build as: ${bodyWeight} (adjust from the reference photo if different)`,
      `Depict this person's chest size as: ${boobsSize} (adjust from the reference photo if different)`,
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
        `Depict this person's age as: ${ageRange}`,
        `Depict this person's body weight/build as: ${bodyWeight} (adjust from the reference photo if different)`,
        `Depict this person's chest size as: ${boobsSize} (adjust from the reference photo if different)`,
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
      text: `Scene description: ${sceneDescription || "an everyday setting"}\nAspect ratio: ${aspectRatio}`,
    });

    const prompt = await generatePrompt(ENVIRONMENT_SYSTEM_PROMPT, content);
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
