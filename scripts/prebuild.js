const fs = require("fs");
const path = require("path");

const folders = ["content", "scripts"];

folders.forEach(folder => {
    const fullPath = path.join(__dirname, "..", folder);
    if (fs.existsSync(fullPath)) {
        fs.readdirSync(fullPath).forEach(file => {
            const filePath = path.join(fullPath, file);
            fs.chmodSync(filePath, 0o644); // read/write for user, read for others
        });
    }
});
console.log("✅ Permissions cleaned");
