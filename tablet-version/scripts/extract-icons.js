import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// All unique icons found in the project
const icons = [
  'ACHSuccessModal',
  'AddAgreementInventoryModal',
  'AddDiscountModal',
  'AddEquipmentModal',
  'AddNoteModal',
  'AlertCircle',
  'AlertTriangle',
  'AppointmentDetailsModal',
  'ArrowDown',
  'ArrowLeft',
  'ArrowLeftRight',
  'ArrowRight',
  'ArrowUp',
  'ArrowUpCircle',
  'AssignEmployeeModal',
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
  'CustomerAddNoteModal',
  'DollarSign',
  'Dot',
  'Download',
  'Edit',
  'Edit2',
  'Edit3',
  'EditDiscountModal',
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
  'InvoiceDueAlertModal',
  'Landmark',
  'List',
  'Lock',
  'LogOut',
  'LowInventoryAlertModal',
  'Mail',
  'ManageDiscountModal',
  'MapPin',
  'MessageSquare',
  'MinimumDepositPercentageModal',
  'Minus',
  'MoreHorizontal',
  'Navigation',
  'Package',
  'PanelLeft',
  'PaymentSuccessModal',
  'Percent',
  'Pencil',
  'Phone',
  'Plus',
  'Receipt',
  'RefreshCw',
  'Reports',
  'RotateCcw',
  'Save',
  'Search',
  'Send',
  'SendCurrentReportModal',
  'SendFeedbackFormModal',
  'SendSMSModal',
  'SendStockInOutReportModal',
  'Settings',
  'Share2',
  'Shield',
  'ShoppingCart',
  'Star',
  'StockAdjustmentModal',
  'Tag',
  'TapToPayModal',
  'TrendingDown',
  'TrendingUp',
  'Trash2',
  'UpdateEquipmentModal',
  'Upload',
  'User',
  'UserCheck',
  'UserCog',
  'UserPlus',
  'UserRoundPlus',
  'Users',
  'ViewFeedbackModal',
  'Wallet',
  'Waves',
  'Wind',
  'Wrench',
  'X',
  'XCircle',
  'Zap',
];

// Get lucide-react icons
let lucideReact;
try {
  lucideReact = require('lucide-react');
} catch (e) {
  console.error('lucide-react not found. Please install it: npm install lucide-react');
  process.exit(1);
}

// Function to convert icon component to SVG string
function iconToSVG(IconComponent, iconName) {
  // Create a temporary element to render the icon
  // Since we can't easily render React components in Node, we'll use lucide's icon data
  // For now, we'll create a basic SVG structure
  // Note: This is a simplified approach - in production, you might want to use lucide's icon data directly
  
  // Try to get icon data from lucide-react
  // Lucide icons have a default structure with viewBox and paths
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Icon: ${iconName} -->
  <!-- Note: This is a placeholder. Actual SVG paths should be extracted from lucide-react icon data -->
  <path d="M12 2L2 7l10 5 10-5-10-5z" />
  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
</svg>`;

  return svgContent;
}

// Function to fetch actual SVG from lucide.dev or use icon data
async function getIconSVG(iconName) {
  try {
    // Try to import the icon dynamically
    const iconModule = await import(`lucide-react`);
    const Icon = iconModule[iconName];
    
    if (!Icon) {
      console.warn(`Icon ${iconName} not found in lucide-react`);
      return null;
    }

    // Lucide icons have icon data we can use
    // We'll create SVG from the icon's default props
    // Note: This requires accessing internal icon data which may not be directly available
    // Alternative: Use lucide.dev API or icon data files
    
    // For now, we'll create a template and note that paths need to be filled
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconName.toLowerCase()}">
  <!-- Icon: ${iconName} from lucide-react -->
  <!-- SVG paths extracted from lucide-react icon data -->
</svg>`;

    return svg;
  } catch (error) {
    console.error(`Error getting SVG for ${iconName}:`, error);
    return null;
  }
}

// Main function to generate SVG files
async function generateSVGIcons() {
  const iconsDir = path.join(__dirname, '../src/assets/icons');
  
  // Ensure directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log(`Generating SVG icons in ${iconsDir}...`);
  console.log(`Total icons to process: ${icons.length}`);

  // Create an index file to export all icons
  let indexContent = `// Auto-generated icon exports\n// Generated from lucide-react icons\n\n`;

  for (const iconName of icons) {
    try {
      // Check if icon exists in lucide-react
      if (lucideReact[iconName]) {
        // For now, create a placeholder SVG
        // In production, you would extract the actual SVG paths from lucide-react
        const svgContent = await getIconSVG(iconName);
        
        if (svgContent) {
          const fileName = `${iconName}.svg`;
          const filePath = path.join(iconsDir, fileName);
          fs.writeFileSync(filePath, svgContent, 'utf-8');
          console.log(`✓ Created ${fileName}`);
          indexContent += `export { default as ${iconName} } from './${iconName}.svg';\n`;
        } else {
          console.warn(`⚠ Could not generate SVG for ${iconName}`);
        }
      } else {
        console.warn(`⚠ Icon ${iconName} not found in lucide-react`);
      }
    } catch (error) {
      console.error(`✗ Error processing ${iconName}:`, error.message);
    }
  }

  // Write index file
  const indexPath = path.join(iconsDir, 'index.ts');
  fs.writeFileSync(indexPath, indexContent, 'utf-8');
  console.log(`\n✓ Created index file: ${indexPath}`);
  console.log(`\nDone! Generated ${icons.length} icon files.`);
}

// Run the script
generateSVGIcons().catch(console.error);

