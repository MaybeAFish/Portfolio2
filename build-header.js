const fs = require("fs");
const path = require("path");

const root = __dirname;
const headerPath = path.join(root, "general", "header", "header.html");
const header = fs.readFileSync(headerPath, "utf8").trim();

const oldHeaderScripts =
  /<script\s+src=["']\/general\/header\/(?:header-loader|header-state)\.js["']\s*><\/script>/gi;

const headerRegex =
  /(?:<script>\s*document\.documentElement\.classList\.add\(["']no-header-transition["']\);\s*<\/script>\s*)?<header\b[^>]*class=["'][^"']*\bsite-header\b[^"']*["'][^>]*>[\s\S]*?<\/header>/i;

function processDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") {
        processDirectory(fullPath);
      }
      continue;
    }

    if (!entry.name.endsWith(".html")) continue;
    if (fullPath === headerPath) continue;

    let html = fs.readFileSync(fullPath, "utf8");

    // Remove old header scripts first
    html = html.replace(oldHeaderScripts, "");

    // Replace existing header
    if (headerRegex.test(html)) {
      html = html.replace(headerRegex, header);
    }
    // Or replace old placeholder
    else if (html.includes('<div id="header-placeholder"></div>')) {
      html = html.replace(
        '<div id="header-placeholder"></div>',
        header
      );
    } else {
      continue;
    }

    // Remove HTML comments
    html = html.replace(/<!--[\s\S]*?-->/g, "");

    fs.writeFileSync(fullPath, html, "utf8");
    console.log(`Updated: ${path.relative(root, fullPath)}`);
  }
}

processDirectory(root);