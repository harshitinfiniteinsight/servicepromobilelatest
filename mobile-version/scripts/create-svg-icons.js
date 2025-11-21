import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// All unique icons used in the project
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

// Function to fetch SVG from URL
function fetchSVG(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Function to create SVG file
async function createSVGFile(iconName) {
  const iconNameLower = iconName.toLowerCase();
  const url = `https://unpkg.com/lucide@latest/icons/${iconNameLower}.svg`;
  
  try {
    const svgContent = await fetchSVG(url);
    // Ensure XML declaration
    const finalSVG = svgContent.includes('<?xml') 
      ? svgContent 
      : `<?xml version="1.0" encoding="UTF-8"?>\n${svgContent}`;
    return finalSVG;
  } catch (error) {
    // Return a basic placeholder SVG
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconNameLower}">
  <title>${iconName}</title>
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="8" x2="12" y2="12"/>
  <line x1="12" y1="16" x2="12.01" y2="16"/>
</svg>`;
  }
}

// Main function
async function generateIcons() {
  const iconsDir = path.join(__dirname, '../src/assets/icons');
  
  // Create directory
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log(`📁 Icons directory: ${iconsDir}`);
  console.log(`📦 Processing ${iconNames.length} icons...\n`);

  const exports = [];
  let success = 0;
  let failed = 0;

  for (const iconName of iconNames) {
    try {
      const svg = await createSVGFile(iconName);
      const fileName = `${iconName}.svg`;
      const filePath = path.join(iconsDir, fileName);
      
      fs.writeFileSync(filePath, svg, 'utf-8');
      console.log(`✓ ${fileName}`);
      success++;
      
      exports.push(`export { default as ${iconName}Icon } from './${iconName}.svg';`);
    } catch (error) {
      console.error(`✗ ${iconName}: ${error.message}`);
      failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Create index.ts
  const indexPath = path.join(iconsDir, 'index.ts');
  const indexContent = `// Auto-generated icon exports
// Generated from lucide-react icons
// Total: ${iconNames.length} icons

${exports.join('\n')}
`;

  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  
  console.log(`\n✅ Created ${success} icons`);
  if (failed > 0) console.log(`⚠️  Failed: ${failed}`);
  console.log(`📄 Index: ${indexPath}`);
}

generateIcons().catch(console.error);

