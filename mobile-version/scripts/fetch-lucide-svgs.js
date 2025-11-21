import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

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

// Fetch SVG from jsdelivr CDN
function fetchIconData(iconName) {
  return new Promise((resolve, reject) => {
    const iconNameLower = iconName.toLowerCase();
    // Use jsdelivr CDN which serves lucide SVGs
    const url = `https://cdn.jsdelivr.net/npm/lucide@latest/icons/${iconNameLower}.svg`;
    
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          const fullRedirectUrl = redirectUrl.startsWith('http') 
            ? redirectUrl 
            : `https://lucide.dev${redirectUrl}`;
          return fetchIconData(iconName); // Retry with redirect
        }
      }
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          // Ensure XML declaration
          const svg = data.includes('<?xml') 
            ? data 
            : `<?xml version="1.0" encoding="UTF-8"?>\n${data}`;
          resolve(svg);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Main function
async function fetchAllIcons() {
  const iconsDir = path.join(__dirname, '../src/assets/icons');
  
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log(`📁 Fetching icons to: ${iconsDir}`);
  console.log(`📦 Processing ${iconNames.length} icons...\n`);

  let success = 0;
  let failed = 0;

  for (const iconName of iconNames) {
    try {
      const svg = await fetchIconData(iconName);
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
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Fetched ${success} icons`);
  if (failed > 0) console.log(`⚠️  Failed: ${failed}`);
}

fetchAllIcons().catch(console.error);

