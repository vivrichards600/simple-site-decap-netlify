const fs = require("fs");
const path = require("path");

const newsDir = path.join(__dirname, "../content/news");
const outPath = path.join(__dirname, "../news-index.json");

const files = fs.readdirSync(newsDir)
    .filter(file => file.endsWith(".md"))
    .map(file => `content/news/${file}`);

fs.writeFileSync(outPath, JSON.stringify(files, null, 2));
console.log("✅ news-index.json created with", files.length, "items.");
