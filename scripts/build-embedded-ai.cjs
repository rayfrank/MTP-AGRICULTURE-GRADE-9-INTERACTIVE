"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const startMarker = "    <!-- MTP_EMBEDDED_AI_START -->";
const endMarker = "    <!-- MTP_EMBEDDED_AI_END -->";

const resources = [
  ["@runtime/transformers.js", "assets/transformers/transformers.min.js", "text/javascript"],
  ["@runtime/ort-loader.js", "assets/transformers/ort-wasm-simd-threaded.jsep.js", "text/javascript"],
  ["@runtime/ort.wasm", "assets/transformers/ort-wasm-simd-threaded.jsep.wasm", "application/wasm"],
  ["smollm2-135m-cpu/config.json", "assets/models/smollm2-135m-cpu/config.json", "application/json"],
  ["smollm2-135m-cpu/generation_config.json", "assets/models/smollm2-135m-cpu/generation_config.json", "application/json"],
  ["smollm2-135m-cpu/merges.txt", "assets/models/smollm2-135m-cpu/merges.txt", "text/plain"],
  ["smollm2-135m-cpu/special_tokens_map.json", "assets/models/smollm2-135m-cpu/special_tokens_map.json", "application/json"],
  ["smollm2-135m-cpu/tokenizer.json", "assets/models/smollm2-135m-cpu/tokenizer.json", "application/json"],
  ["smollm2-135m-cpu/tokenizer_config.json", "assets/models/smollm2-135m-cpu/tokenizer_config.json", "application/json"],
  ["smollm2-135m-cpu/vocab.json", "assets/models/smollm2-135m-cpu/vocab.json", "application/json"],
  ["smollm2-135m-cpu/onnx/model_quantized.onnx", "assets/models/smollm2-135m-cpu/onnx/model_quantized.onnx", "application/octet-stream"],
];

function escapeAttribute(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

let html = fs.readFileSync(indexPath, "utf8");
const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker, start + startMarker.length);
if (start < 0 || end < 0) {
  throw new Error("The embedded AI markers are missing from index.html.");
}

let rawBytes = 0;
const tags = resources.map(([virtualPath, relativeFile, mime]) => {
  const file = path.join(root, relativeFile);
  if (!fs.existsSync(file)) throw new Error(`Missing embedded AI source: ${relativeFile}`);
  const data = fs.readFileSync(file);
  rawBytes += data.length;
  return `    <script type="application/octet-stream" data-mtp-ai-path="${escapeAttribute(virtualPath)}" data-size="${data.length}" data-mime="${escapeAttribute(mime)}">${data.toString("base64")}</script>`;
});

const replacement = `${startMarker}\n${tags.join("\n")}\n${endMarker}`;
html = html.slice(0, start) + replacement + html.slice(end + endMarker.length);

const temporaryPath = `${indexPath}.embedded.tmp`;
fs.writeFileSync(temporaryPath, html);
fs.renameSync(temporaryPath, indexPath);

const finalBytes = fs.statSync(indexPath).size;
console.log(`Embedded ${resources.length} AI resources (${(rawBytes / 1024 / 1024).toFixed(1)} MiB raw).`);
console.log(`index.html is now ${(finalBytes / 1024 / 1024).toFixed(1)} MiB.`);
