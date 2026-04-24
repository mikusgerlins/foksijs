import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "public");

const makeSvg = ({ size, padding = 0, bg = "#FF7A59", fg = "#FFFFFF" }) => {
  const inner = size - padding * 2;
  const r = size * 0.22;
  const fontSize = Math.round(inner * 0.58);
  const cy = size / 2 + fontSize * 0.34;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${r}" ry="${r}" fill="${bg}"/>
  <text x="50%" y="${cy}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${fontSize}" fill="${fg}">F</text>
</svg>`;
};

const render = async (svg, outPath) => {
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log("wrote", outPath);
};

await mkdir(OUT, { recursive: true });

await render(makeSvg({ size: 192 }), path.join(OUT, "icon-192.png"));
await render(makeSvg({ size: 512 }), path.join(OUT, "icon-512.png"));
await render(makeSvg({ size: 512, padding: 64 }), path.join(OUT, "icon-maskable-512.png"));
await render(makeSvg({ size: 180 }), path.join(OUT, "apple-touch-icon.png"));
