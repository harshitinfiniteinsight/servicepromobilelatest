import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

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

// Get lucide-react package path
function getLucideIconData(iconName) {
  try {
    // Try to require lucide-react and get icon data
    const lucideReact = require('lucide-react');
    const Icon = lucideReact[iconName];
    
    if (!Icon) {
      return null;
    }
    
    // Lucide icons have a default export that contains icon data
    // The icon data includes paths, viewBox, etc.
    // We need to access the icon's internal data structure
    // Note: This may vary by lucide-react version
    
    // Try to get icon data from the icon component
    // In lucide-react, icons are functions that return JSX
    // We can try to access the icon's defaultProps or similar
    
    // Alternative: Use lucide's icon data files directly
    // They're typically in node_modules/lucide-react/dist/esm/icons/
    const lucidePath = require.resolve('lucide-react');
    const lucideDir = path.dirname(lucidePath);
    const iconFile = path.join(lucideDir, 'dist', 'esm', 'icons', `${iconName.toLowerCase()}.js`);
    
    if (fs.existsSync(iconFile)) {
      // Read the icon file
      const iconContent = fs.readFileSync(iconFile, 'utf-8');
      
      // Extract paths from the icon file
      // Icon files typically export an object with paths array
      // Example: export default { paths: [...], viewBox: "0 0 24 24" }
      const pathsMatch = iconContent.match(/paths:\s*\[(.*?)\]/s);
      const viewBoxMatch = iconContent.match(/viewBox:\s*["']([^"']+)["']/);
      
      if (pathsMatch) {
        // Extract path strings
        const paths = pathsMatch[1]
          .split(',')
          .map(p => p.trim().replace(/^["']|["']$/g, ''))
          .filter(p => p);
        
        const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
        
        const svgPaths = paths.map(p => `  <path d="${p}" />`).join('\n');
        
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconName.toLowerCase()}">
${svgPaths}
</svg>`;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting ${iconName}:`, error.message);
    return null;
  }
}

// Main function
async function extractIcons() {
  const iconsDir = path.join(__dirname, '../src/assets/icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log(`📁 Extracting icons to: ${iconsDir}`);
  console.log(`📦 Processing ${iconNames.length} icons...\n`);

  let success = 0;
  let failed = 0;

  for (const iconName of iconNames) {
    try {
      const svg = getLucideIconData(iconName);
      
      if (svg) {
        const fileName = `${iconName}.svg`;
        const filePath = path.join(iconsDir, fileName);
        fs.writeFileSync(filePath, svg, 'utf-8');
        console.log(`✓ ${fileName}`);
        success++;
      } else {
        console.warn(`⚠ ${iconName}: Could not extract SVG data`);
        failed++;
      }
    } catch (error) {
      console.error(`✗ ${iconName}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n✅ Extracted ${success} icons`);
  if (failed > 0) console.log(`⚠️  Failed: ${failed}`);
}

extractIcons().catch(console.error);

