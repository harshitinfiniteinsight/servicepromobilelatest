import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import https from 'https';

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

// Function to fetch SVG from lucide.dev API
function fetchSVGFromLucide(iconName) {
  return new Promise((resolve, reject) => {
    const iconNameLower = iconName.toLowerCase();
    // Try lucide.dev API endpoint
    const url = `https://api.lucide.dev/icons/${iconNameLower}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const iconData = JSON.parse(data);
            // Build SVG from icon data
            const paths = iconData.paths || [];
            const viewBox = iconData.viewBox || '0 0 24 24';
            
            const svgPaths = paths.map(path => 
              `<path d="${path}" />`
            ).join('\n  ');
            
            const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconNameLower}">
  ${svgPaths}
</svg>`;
            resolve(svg);
          } catch (e) {
            reject(new Error('Failed to parse icon data'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Function to get SVG from lucide-react directly
function getSVGFromLucideReact(iconName) {
  try {
    const lucideReact = require('lucide-react');
    const Icon = lucideReact[iconName];
    
    if (!Icon) {
      return null;
    }
    
    // Lucide icons have a default export with icon data
    // We need to access the icon's paths
    // This is a workaround - lucide-react doesn't expose paths directly
    // So we'll use the API approach instead
    return null;
  } catch (e) {
    return null;
  }
}

// Main function
async function fixIcons() {
  const iconsDir = path.join(__dirname, '../src/assets/icons');
  
  console.log(`📁 Fixing icons in: ${iconsDir}`);
  console.log(`📦 Processing ${iconNames.length} icons...\n`);

  let success = 0;
  let failed = 0;

  for (const iconName of iconNames) {
    try {
      const svg = await fetchSVGFromLucide(iconName);
      const fileName = `${iconName}.svg`;
      const filePath = path.join(iconsDir, fileName);
      
      fs.writeFileSync(filePath, svg, 'utf-8');
      console.log(`✓ ${fileName}`);
      success++;
    } catch (error) {
      console.error(`✗ ${iconName}: ${error.message}`);
      failed++;
    }
    
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  console.log(`\n✅ Fixed ${success} icons`);
  if (failed > 0) console.log(`⚠️  Failed: ${failed}`);
}

fixIcons().catch(console.error);

