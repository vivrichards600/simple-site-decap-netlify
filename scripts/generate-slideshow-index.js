// scripts/generate-slideshow-index.js
const fs = require("fs");
const path = require("path");

const slideshowDir = path.join(__dirname, "../content/slideshow");
const outPath = path.join(__dirname, "../slideshow-index.json");

const files = fs.readdirSync(slideshowDir)
    .filter(file => file.endsWith(".md"))
    .map(file => `content/slideshow/${file}`);

fs.writeFileSync(outPath, JSON.stringify(files, null, 2));
console.log("✅ slideshow-index.json created with", files.length, "items.");
