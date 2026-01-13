import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconNames = [
  'AlertCircle',
  'AlertTriangle',
  'ArrowDown',
  'ArrowLeft',
  'ArrowLeftRight',
  'ArrowRight',
  'ArrowUp',
  'ArrowUpCircle',
  'Ban',
  'BarChart3',
  'Bell',
  'BookmarkCheck',
  'Briefcase',
  'Building2',
  'Calendar',
  'Camera',
  'Check',
  'CheckCircle',
  'CheckCircle2',
  'ChevronDown',
  'ChevronLeft',
  'ChevronRight',
  'ChevronsUpDown',
  'ChevronUp',
  'Circle',
  'ClipboardList',
  'Clock',
  'CreditCard',
  'DollarSign',
  'Dot',
  'Download',
  'Edit',
  'Edit2',
  'Edit3',
  'Eye',
  'FileText',
  'Globe',
  'Grid3x3',
  'GripVertical',
  'Hammer',
  'HelpCircle',
  'History',
  'Home',
  'Image',
  'Info',
  'Landmark',
  'List',
  'Lock',
  'LogOut',
  'Mail',
  'MapPin',
  'MessageSquare',
  'Minus',
  'MoreHorizontal',
  'Navigation',
  'Package',
  'PanelLeft',
  'Percent',
  'Pencil',
  'Phone',
  'Plus',
  'Receipt',
  'RefreshCw',
  'RotateCcw',
  'Save',
  'Search',
  'Send',
  'Settings',
  'Share2',
  'Shield',
  'ShoppingCart',
  'Star',
  'Tag',
  'TrendingDown',
  'TrendingUp',
  'Trash2',
  'Upload',
  'User',
  'UserCheck',
  'UserCog',
  'UserPlus',
  'UserRoundPlus',
  'Users',
  'Wallet',
  'Waves',
  'Wind',
  'Wrench',
  'X',
  'XCircle',
  'Zap',
];

// Convert PascalCase to kebab-case (e.g., LogOut -> log-out)
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

// Parse icon file and extract SVG paths
function parseIconFile(iconName) {
  const iconNameKebab = toKebabCase(iconName);
  const iconPath = path.join(__dirname, '../node_modules/lucide-react/dist/esm/icons', `${iconNameKebab}.js`);
  
  if (!fs.existsSync(iconPath)) {
    return null;
  }
  
  const content = fs.readFileSync(iconPath, 'utf-8');
  
  // Extract paths array from createLucideIcon call
  // Format: createLucideIcon("Name", [["path", { d: "..." }], ["polyline", { points: "..." }]])
  // Use a more robust regex that handles nested brackets
  const iconDataMatch = content.match(/createLucideIcon\([^,]+,\s*(\[[\s\S]*?\])\s*\)/);
  
  if (!iconDataMatch) {
    return null;
  }
  
  const pathsData = iconDataMatch[1];
  const elements = [];
  
  // Extract all path/polyline/circle/etc elements
  // Handle both ["type", {attrs}] format with proper bracket matching
  // Match: ["type", { ... }] where ... can contain nested objects
  const elementRegex = /\["(\w+)",\s*\{([^}]*)\}\]/g;
  let match;
  
  // Helper to extract attribute value (handles both quoted and unquoted)
  const getAttr = (attrs, name) => {
    // Try quoted string first
    const quotedMatch = attrs.match(new RegExp(`${name}:\\s*"([^"]+)"`));
    if (quotedMatch) return quotedMatch[1];
    // Try unquoted/numeric
    const unquotedMatch = attrs.match(new RegExp(`${name}:\\s*([^,\\s}]+)`));
    return unquotedMatch ? unquotedMatch[1] : null;
  };
  
  while ((match = elementRegex.exec(pathsData)) !== null) {
    const elementType = match[1];
    const attrs = match[2];
    
    // Extract attributes (handle both quoted and unquoted values)
    const d = getAttr(attrs, 'd');
    const points = getAttr(attrs, 'points');
    const cx = getAttr(attrs, 'cx');
    const cy = getAttr(attrs, 'cy');
    const r = getAttr(attrs, 'r');
    const x = getAttr(attrs, 'x');
    const y = getAttr(attrs, 'y');
    const width = getAttr(attrs, 'width');
    const height = getAttr(attrs, 'height');
    const x1 = getAttr(attrs, 'x1');
    const y1 = getAttr(attrs, 'y1');
    const x2 = getAttr(attrs, 'x2');
    const y2 = getAttr(attrs, 'y2');
    
    let element = '';
    
    if (elementType === 'path' && d) {
      element = `  <path d="${d}" />`;
    } else if (elementType === 'polyline' && points) {
      element = `  <polyline points="${points}" />`;
    } else if (elementType === 'circle' && cx && cy && r) {
      element = `  <circle cx="${cx}" cy="${cy}" r="${r}" />`;
    } else if (elementType === 'line' && x1 && y1 && x2 && y2) {
      element = `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
    } else if (elementType === 'rect' && x && y && width && height) {
      element = `  <rect x="${x}" y="${y}" width="${width}" height="${height}" />`;
    } else if (elementType === 'polygon' && points) {
      element = `  <polygon points="${points}" />`;
    }
    
    if (element) {
      elements.push(element);
    }
  }
  
  if (elements.length === 0) {
    return null;
  }
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconNameKebab}">
${elements.join('\n')}
</svg>`;
  
  return svg;
}

// Main function
function generateSVGs() {
  const iconsDir = path.join(__dirname, '../src/assets/icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log(`📁 Generating SVGs in: ${iconsDir}`);
  console.log(`📦 Processing ${iconNames.length} icons...\n`);

  const exports = [];
  let success = 0;
  let failed = 0;

  for (const iconName of iconNames) {
    try {
      const svg = parseIconFile(iconName);
      
      if (svg) {
        const fileName = `${iconName}.svg`;
        const filePath = path.join(iconsDir, fileName);
        fs.writeFileSync(filePath, svg, 'utf-8');
        console.log(`✓ ${fileName}`);
        success++;
        exports.push(`export { default as ${iconName}Icon } from './${iconName}.svg';`);
      } else {
        console.warn(`⚠ ${iconName}: Could not parse`);
        failed++;
      }
    } catch (error) {
      console.error(`✗ ${iconName}: ${error.message}`);
      failed++;
    }
  }

  // Create index.ts
  const indexPath = path.join(iconsDir, 'index.ts');
  const indexContent = `// Auto-generated icon exports
// Generated from lucide-react icons
// Total: ${iconNames.length} icons

${exports.join('\n')}
`;

  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  
  console.log(`\n✅ Generated ${success} SVG icons`);
  if (failed > 0) console.log(`⚠️  Failed: ${failed}`);
  console.log(`📄 Index: ${indexPath}`);
}

generateSVGs();

