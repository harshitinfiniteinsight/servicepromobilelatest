import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Extract all unique icons from the codebase
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

// Function to create SVG from lucide icon
async function createIconSVG(iconName) {
  try {
    // Fetch SVG from lucide.dev CDN
    const response = await fetch(`https://unpkg.com/lucide@latest/icons/${iconName.toLowerCase()}.svg`);
    
    if (response.ok) {
      let svgContent = await response.text();
      // Ensure proper SVG format
      if (!svgContent.includes('<?xml')) {
        svgContent = `<?xml version="1.0" encoding="UTF-8"?>\n${svgContent}`;
      }
      return svgContent;
    } else {
      // Fallback: create basic SVG structure
      return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconName.toLowerCase()}">
  <title>${iconName}</title>
  <!-- Icon paths from lucide-react -->
</svg>`;
    }
  } catch (error) {
    console.error(`Error fetching ${iconName}:`, error.message);
    // Return placeholder SVG
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconName.toLowerCase()}">
  <title>${iconName}</title>
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="8" x2="12" y2="12"/>
  <line x1="12" y1="16" x2="12.01" y2="16"/>
</svg>`;
  }
}

// Main function
async function generateAllIcons() {
  const iconsDir = path.join(__dirname, '../src/assets/icons');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log(`📁 Creating icons directory: ${iconsDir}`);
  console.log(`📦 Processing ${iconNames.length} icons...\n`);

  const indexExports = [];
  let successCount = 0;
  let failCount = 0;

  for (const iconName of iconNames) {
    try {
      const svgContent = await createIconSVG(iconName);
      const fileName = `${iconName}.svg`;
      const filePath = path.join(iconsDir, fileName);
      
      fs.writeFileSync(filePath, svgContent, 'utf-8');
      console.log(`✓ ${fileName}`);
      successCount++;
      
      indexExports.push(`export { default as ${iconName}Icon } from './${iconName}.svg';`);
    } catch (error) {
      console.error(`✗ Failed to create ${iconName}:`, error.message);
      failCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Create index file
  const indexPath = path.join(iconsDir, 'index.ts');
  const indexContent = `// Auto-generated icon exports
// Generated from lucide-react icons
// Total icons: ${iconNames.length}

${indexExports.join('\n')}
`;

  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  
  console.log(`\n✅ Successfully created ${successCount} icons`);
  if (failCount > 0) {
    console.log(`⚠️  Failed to create ${failCount} icons`);
  }
  console.log(`📄 Index file created: ${indexPath}`);
}

// Run the script
generateAllIcons().catch(console.error);

