import fs from 'fs';
import path from 'path';

// Location of the markdown manifest and destination TS file
const projectRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(projectRoot, 'app', 'src', 'client', 'components', 'Products', 'aforo_product_identity_manifest.md');
const outFile = path.join(projectRoot, 'app', 'src', 'client', 'components', 'Products', 'icons', 'iconSymbols.ts');

interface IconSymbol { id: string; label: string; svgPath: string; }

const md = fs.readFileSync(manifestPath, 'utf8');

// Regexes
const fileBlock = /##\s+([\w\-]+)[\s\S]*?File:\s+`([^`]+)`[\s\S]*?```svg([\s\S]*?)```/g;
const pathRegex = /<path\s+[^>]*?d="([^"]+)"/i;

const symbols: IconSymbol[] = [];
let match: RegExpExecArray | null;
while ((match = fileBlock.exec(md))) {
  const sectionLabel = match[1];
  const fileName = match[2];
  const svgContent = match[3];

  const pathMatch = pathRegex.exec(svgContent);
  if (!pathMatch) continue;
  const svgPath = pathMatch[1];

  const id = fileName.replace(/\.svg$/i, '').replace(/[^a-z0-9]+/gi, '-');
  symbols.push({ id, label: sectionLabel.replace(/_/g, ' '), svgPath });
}

const header = `// AUTO-GENERATED via scripts/buildIcons.ts – DO NOT EDIT MANUALLY\n`;
const iface = `export interface IconSymbol {\n  id: string;\n  label: string;\n  svgPath: string;\n}\n`;
const array = `export const iconSymbols: IconSymbol[] = ${JSON.stringify(symbols, null, 2)};\n`;

fs.writeFileSync(outFile, header + '\n' + iface + '\n' + array);

console.log(`Generated ${symbols.length} icons to`, path.relative(projectRoot, outFile));
