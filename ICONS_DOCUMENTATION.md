# Icons Documentation

This document provides a comprehensive guide to all icons used in the ServicePro Mobile application.

## Icon Libraries Used

### 1. Lucide React (Online Library)
- **Library**: [lucide-react](https://lucide.dev/)
- **Version**: `^0.312.0` (mobile-version) / `^0.462.0` (root)
- **NPM Package**: [lucide-react](https://www.npmjs.com/package/lucide-react)
- **Official Website**: https://lucide.dev/
- **GitHub**: https://github.com/lucide-icons/lucide
- **Documentation**: https://lucide.dev/guide/packages/lucide-react

### 2. Local SVG Icons
- **Location**: `mobile-version/src/assets/icons/`
- **Total Icons**: 90 SVG files
- **Index File**: `mobile-version/src/assets/icons/index.ts`

---

## How to Use Icons

### Using Lucide React Icons

```typescript
// Import icons from lucide-react
import { Home, Users, Settings } from "lucide-react";

// Use in your component
<Home className="w-5 h-5" />
<Users size={24} />
<Settings strokeWidth={1.5} />
```

### Using Local SVG Icons

```typescript
// Import from the icons folder
import { HomeIcon, UsersIcon } from "@/assets/icons";

// Use in your component
<img src={HomeIcon} alt="Home" />
```

---

## All Icons Used in the Project

### Lucide React Icons (121 unique icons)

| Icon Name | Lucide Link | Usage |
|-----------|-------------|-------|
| AlertCircle | https://lucide.dev/icons/alert-circle | Alert indicators |
| AlertTriangle | https://lucide.dev/icons/alert-triangle | Warning indicators |
| ArrowDown | https://lucide.dev/icons/arrow-down | Downward navigation |
| ArrowDownCircle | https://lucide.dev/icons/arrow-down-circle | Circular down arrow |
| ArrowLeft | https://lucide.dev/icons/arrow-left | Left navigation |
| ArrowRight | https://lucide.dev/icons/arrow-right | Right navigation |
| ArrowUp | https://lucide.dev/icons/arrow-up | Upward navigation |
| ArrowUpCircle | https://lucide.dev/icons/arrow-up-circle | Circular up arrow |
| Banknote | https://lucide.dev/icons/banknote | Payment/money |
| BarChart3 | https://lucide.dev/icons/bar-chart-3 | Analytics/charts |
| Bell | https://lucide.dev/icons/bell | Notifications |
| Bot | https://lucide.dev/icons/bot | AI/chatbot |
| Briefcase | https://lucide.dev/icons/briefcase | Jobs/business |
| Building2 | https://lucide.dev/icons/building-2 | Business/organization |
| Calendar | https://lucide.dev/icons/calendar | Calendar/date |
| CalendarDays | https://lucide.dev/icons/calendar-days | Calendar view |
| CalendarRange | https://lucide.dev/icons/calendar-range | Date range |
| Camera | https://lucide.dev/icons/camera | Photo capture |
| Check | https://lucide.dev/icons/check | Success/confirm |
| CheckCircle | https://lucide.dev/icons/check-circle | Success indicator |
| CheckCircle2 | https://lucide.dev/icons/check-circle-2 | Success indicator (alt) |
| CheckSquare | https://lucide.dev/icons/check-square | Checkbox checked |
| ChevronDown | https://lucide.dev/icons/chevron-down | Dropdown indicator |
| ChevronLeft | https://lucide.dev/icons/chevron-left | Previous/back |
| ChevronRight | https://lucide.dev/icons/chevron-right | Next/forward |
| ChevronUp | https://lucide.dev/icons/chevron-up | Expand indicator |
| ChevronsUpDown | https://lucide.dev/icons/chevrons-up-down | Sort indicator |
| Circle | https://lucide.dev/icons/circle | Circle shape |
| ClipboardList | https://lucide.dev/icons/clipboard-list | Lists/tasks |
| Clock | https://lucide.dev/icons/clock | Time/schedule |
| CreditCard | https://lucide.dev/icons/credit-card | Payment method |
| DollarSign | https://lucide.dev/icons/dollar-sign | Money/currency |
| Dot | https://lucide.dev/icons/dot | Bullet point |
| Download | https://lucide.dev/icons/download | Download action |
| Edit | https://lucide.dev/icons/edit | Edit action |
| Edit2 | https://lucide.dev/icons/edit-2 | Edit action (alt) |
| Edit3 | https://lucide.dev/icons/edit-3 | Edit action (alt 2) |
| Eye | https://lucide.dev/icons/eye | View/visibility |
| EyeOff | https://lucide.dev/icons/eye-off | Hide/password |
| FileCheck | https://lucide.dev/icons/file-check | Verified file |
| FileDown | https://lucide.dev/icons/file-down | Download file |
| FileImage | https://lucide.dev/icons/file-image | Image file |
| FileSpreadsheet | https://lucide.dev/icons/file-spreadsheet | Spreadsheet file |
| FileText | https://lucide.dev/icons/file-text | Document/file |
| FileX | https://lucide.dev/icons/file-x | Delete file |
| Filter | https://lucide.dev/icons/filter | Filter/search |
| FlaskConical | https://lucide.dev/icons/flask-conical | Science/chemical |
| Globe | https://lucide.dev/icons/globe | Website/internet |
| Grid3x3 | https://lucide.dev/icons/grid-3x3 | Grid view |
| GripVertical | https://lucide.dev/icons/grip-vertical | Drag handle |
| Hammer | https://lucide.dev/icons/hammer | Tools/construction |
| History | https://lucide.dev/icons/history | History/previous |
| Home | https://lucide.dev/icons/home | Home/dashboard |
| Info | https://lucide.dev/icons/info | Information |
| Keyboard | https://lucide.dev/icons/keyboard | Keyboard input |
| Landmark | https://lucide.dev/icons/landmark | Bank/location |
| LayoutGrid | https://lucide.dev/icons/layout-grid | Grid layout |
| Link | https://lucide.dev/icons/link | Link/URL |
| Link2 | https://lucide.dev/icons/link-2 | Link (alt) |
| List | https://lucide.dev/icons/list | List view |
| Loader2 | https://lucide.dev/icons/loader-2 | Loading spinner |
| Lock | https://lucide.dev/icons/lock | Security/locked |
| Mail | https://lucide.dev/icons/mail | Email |
| MapPin | https://lucide.dev/icons/map-pin | Location |
| MapPinned | https://lucide.dev/icons/map-pinned | Pinned location |
| MessageCircle | https://lucide.dev/icons/message-circle | Chat/message |
| MessageSquare | https://lucide.dev/icons/message-square | Message/comment |
| Minus | https://lucide.dev/icons/minus | Remove/decrease |
| MoreHorizontal | https://lucide.dev/icons/more-horizontal | More options |
| MoreVertical | https://lucide.dev/icons/more-vertical | More options (vertical) |
| Navigation | https://lucide.dev/icons/navigation | Navigation/directions |
| Package | https://lucide.dev/icons/package | Package/product |
| PackageX | https://lucide.dev/icons/package-x | Package unavailable |
| Palette | https://lucide.dev/icons/palette | Colors/themes |
| PanelLeft | https://lucide.dev/icons/panel-left | Sidebar toggle |
| PenTool | https://lucide.dev/icons/pen-tool | Drawing/writing |
| Pencil | https://lucide.dev/icons/pencil | Edit/write |
| Percent | https://lucide.dev/icons/percent | Percentage/discount |
| Phone | https://lucide.dev/icons/phone | Phone/call |
| Plus | https://lucide.dev/icons/plus | Add/create |
| Printer | https://lucide.dev/icons/printer | Print action |
| Receipt | https://lucide.dev/icons/receipt | Receipt/invoice |
| RefreshCw | https://lucide.dev/icons/refresh-cw | Refresh/reload |
| Repeat | https://lucide.dev/icons/repeat | Repeat/recurring |
| RotateCcw | https://lucide.dev/icons/rotate-ccw | Rotate/undo |
| Route | https://lucide.dev/icons/route | Route/path |
| Save | https://lucide.dev/icons/save | Save action |
| Search | https://lucide.dev/icons/search | Search action |
| Send | https://lucide.dev/icons/send | Send message |
| Settings | https://lucide.dev/icons/settings | Settings/configuration |
| Share2 | https://lucide.dev/icons/share-2 | Share action |
| ShoppingCart | https://lucide.dev/icons/shopping-cart | Shopping cart |
| Smartphone | https://lucide.dev/icons/smartphone | Mobile device |
| SquarePen | https://lucide.dev/icons/square-pen | Edit/write (alt) |
| Star | https://lucide.dev/icons/star | Rating/favorite |
| StickyNote | https://lucide.dev/icons/sticky-note | Note/memo |
| Tag | https://lucide.dev/icons/tag | Tag/label |
| Tags | https://lucide.dev/icons/tags | Multiple tags |
| Timer | https://lucide.dev/icons/timer | Timer/countdown |
| Trash2 | https://lucide.dev/icons/trash-2 | Delete action |
| TrendingDown | https://lucide.dev/icons/trending-down | Downward trend |
| TrendingUp | https://lucide.dev/icons/trending-up | Upward trend |
| Upload | https://lucide.dev/icons/upload | Upload action |
| User | https://lucide.dev/icons/user | User/profile |
| UserCheck | https://lucide.dev/icons/user-check | Verified user |
| UserCog | https://lucide.dev/icons/user-cog | User settings |
| UserPlus | https://lucide.dev/icons/user-plus | Add user |
| UserRoundPlus | https://lucide.dev/icons/user-round-plus | Add user (round) |
| UserX | https://lucide.dev/icons/user-x | Remove user |
| Users | https://lucide.dev/icons/users | Multiple users |
| Wallet | https://lucide.dev/icons/wallet | Wallet/payment |
| Waves | https://lucide.dev/icons/waves | Payment method |
| Wifi | https://lucide.dev/icons/wifi | Wireless/connection |
| Wind | https://lucide.dev/icons/wind | HVAC/air |
| Wrench | https://lucide.dev/icons/wrench | Tools/repair |
| X | https://lucide.dev/icons/x | Close/cancel |
| XCircle | https://lucide.dev/icons/x-circle | Error/close |
| Zap | https://lucide.dev/icons/zap | Lightning/electricity |

---

## Local SVG Icons (90 icons)

All local SVG icons are located in: `mobile-version/src/assets/icons/`

### List of Local SVG Icons:

1. AlertCircle.svg
2. AlertTriangle.svg
3. ArrowDown.svg
4. ArrowLeft.svg
5. ArrowLeftRight.svg
6. ArrowRight.svg
7. ArrowUp.svg
8. ArrowUpCircle.svg
9. Ban.svg
10. BarChart3.svg
11. Bell.svg
12. BookmarkCheck.svg
13. Briefcase.svg
14. Building2.svg
15. Calendar.svg
16. Camera.svg
17. Check.svg
18. CheckCircle.svg
19. CheckCircle2.svg
20. ChevronDown.svg
21. ChevronLeft.svg
22. ChevronRight.svg
23. ChevronsUpDown.svg
24. ChevronUp.svg
25. Circle.svg
26. ClipboardList.svg
27. Clock.svg
28. CreditCard.svg
29. DollarSign.svg
30. Dot.svg
31. Download.svg
32. Edit.svg
33. Edit2.svg
34. Edit3.svg
35. Eye.svg
36. FileText.svg
37. Globe.svg
38. Grid3x3.svg
39. GripVertical.svg
40. Hammer.svg
41. HelpCircle.svg
42. History.svg
43. Home.svg
44. Image.svg
45. Info.svg
46. Landmark.svg
47. List.svg
48. Lock.svg
49. LogOut.svg
50. Mail.svg
51. MapPin.svg
52. MessageSquare.svg
53. Minus.svg
54. MoreHorizontal.svg
55. Navigation.svg
56. Package.svg
57. PanelLeft.svg
58. Pencil.svg
59. Percent.svg
60. Phone.svg
61. Plus.svg
62. Receipt.svg
63. RefreshCw.svg
64. RotateCcw.svg
65. Save.svg
66. Search.svg
67. Send.svg
68. Settings.svg
69. Share2.svg
70. Shield.svg
71. ShoppingCart.svg
72. Star.svg
73. Tag.svg
74. Trash2.svg
75. TrendingDown.svg
76. TrendingUp.svg
77. Upload.svg
78. User.svg
79. UserCheck.svg
80. UserCog.svg
81. UserPlus.svg
82. UserRoundPlus.svg
83. Users.svg
84. Wallet.svg
85. Waves.svg
86. Wind.svg
87. Wrench.svg
88. X.svg
89. XCircle.svg
90. Zap.svg

---

## Quick Reference Links

### Lucide React Resources:
- **Main Website**: https://lucide.dev/
- **React Package**: https://www.npmjs.com/package/lucide-react
- **Icon Search**: https://lucide.dev/icons (search for any icon name)
- **GitHub Repository**: https://github.com/lucide-icons/lucide
- **Installation Guide**: https://lucide.dev/guide/packages/lucide-react

### Installation:
```bash
npm install lucide-react
# or
yarn add lucide-react
```

### Example Usage:
```typescript
import { Home, Users, Settings } from "lucide-react";

function MyComponent() {
  return (
    <div>
      <Home size={24} className="text-blue-500" />
      <Users size={24} className="text-green-500" />
      <Settings size={24} className="text-gray-500" />
    </div>
  );
}
```

---

## Notes for Developers

1. **Prefer Lucide React**: For new icons, use lucide-react as it's already installed and provides consistent styling.

2. **Local SVG Icons**: The local SVG icons in `mobile-version/src/assets/icons/` are extracted from lucide-react and can be used when you need the actual SVG files.

3. **Icon Naming**: Lucide icons use PascalCase (e.g., `Home`, `UserCheck`). When importing, use the exact name.

4. **Customization**: Lucide icons support props like `size`, `strokeWidth`, `color`, and `className` for customization.

5. **Performance**: Lucide React icons are tree-shakeable, so only imported icons are included in your bundle.

---

## Icon Usage Statistics

- **Total Lucide React Icons Used**: 119 unique icons (121 including aliases)
- **Total Local SVG Files**: 90 SVG files
- **Exported in index.ts**: 77 icons (13 SVG files missing from exports)
- **Primary Icon Library**: Lucide React
- **Local Icons Location**: `mobile-version/src/assets/icons/`

### Note on Discrepancies

1. **Missing Exports**: Some SVG files exist but are not exported in `index.ts`:
   - BarChart3, Building2, CheckCircle2, Edit, Edit2, Edit3, Grid3x3, Phone, Share2, Star, Trash2, Waves, Wrench, XCircle

2. **Icon Aliases**: Some imports use aliases (e.g., `CalendarIcon`, `Image`) which are not separate icons but renamed imports.

---

*Last Updated: November 24, 2025*
*Generated from project codebase analysis*

