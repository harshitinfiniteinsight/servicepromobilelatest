# ServicePro Mobile

Mobile-optimized version of ServicePro built with React + Capacitor for Android deployment.

## Features

- **Mobile-First Design**: Optimized for touchscreens and small displays
- **Bottom Navigation**: Easy thumb-friendly navigation
- **Card-Based Layouts**: No tables, everything in digestible cards
- **Swipeable Actions**: Swipe cards for quick edit/delete
- **Pull to Refresh**: Native-feeling data refresh
- **Native Android App**: Deploys as native Android application via Capacitor

## Project Structure

```
mobile-version/
├── android/                  # Capacitor Android platform
├── src/
│   ├── components/
│   │   ├── layout/          # MobileLayout, BottomNav, MobileHeader
│   │   ├── mobile/          # Mobile-specific components
│   │   └── ui/              # Shared UI components
│   ├── pages/               # All 39 mobile-optimized pages
│   ├── data/                # Mock data (shared with desktop)
│   ├── lib/                 # Utilities
│   └── hooks/               # React hooks
├── capacitor.config.ts      # Capacitor configuration
└── package.json
```

## Development

### Web Development
```bash
# Install dependencies
npm install

# Start dev server (port 8081)
npm run dev
```

Access at: `http://localhost:8081`

### Build for Production
```bash
# Build web assets
npm run build

# Sync with Capacitor
npm run cap:sync

# Open in Android Studio
npm run cap:open:android

# Or run directly on device
npm run cap:run:android
```

## Key Design Decisions

### Navigation
- **Bottom Tab Bar**: 5 tabs (Home, Customers, Jobs, Invoices, More)
- **Mobile Header**: Back button, title, action buttons
- **No Sidebar**: Simplified for mobile screens

### Layouts
- **Single Column**: All layouts fit 375px width minimum
- **Card-Based**: Tables converted to scrollable card lists
- **Collapsible Sections**: Accordion patterns for long content
- **Bottom Sheets**: Modals slide up from bottom

### Touch Optimizations
- **44px Minimum Touch Targets**: All buttons and interactive elements
- **Swipe Gestures**: Cards support swipe-to-edit/delete
- **Pull-to-Refresh**: All list pages support pull down to refresh
- **Safe Areas**: Respects notches and system UI

### Performance
- **Lazy Loading**: Pages load on demand
- **Virtual Scrolling**: Long lists use virtual scrolling
- **Optimized Images**: WebP format with lazy loading
- **Minimal Bundle**: Tree-shaking and code splitting

## Pages Implemented

### Authentication (3 pages)
- SignIn - Full screen login
- SignUp - Multi-step registration
- Walkthrough - Onboarding slides

### Core Pages (12 pages)
- Index/Dashboard - Scrollable stats and quick actions
- Customers - Card list with search
- CustomerDetails - Tabbed details view
- Jobs - Status tabs with cards
- Invoices - Card list with swipe actions
- AddInvoice - Multi-step form
- InvoiceDueAlert - Alert cards
- Estimates - Status tabs
- AddEstimate - Multi-step form
- ManageAppointments - Calendar + list
- AddAppointment - Simplified form
- Reports - Card grid

### Additional Modules (24 pages)
- Agreements (3 pages)
- Employees (3 pages)
- Inventory (4 pages)
- Settings (13 pages)
- NotFound

Total: **39 mobile-optimized pages**

## Mobile Components

### Layout Components
- `MobileLayout` - Main wrapper with BottomNav
- `BottomNav` - 5-tab navigation
- `MobileHeader` - Top app bar with back button

### Mobile Components
- `MobileCard` - Touch-optimized card
- `MobileList` - Scrollable list container
- `BottomSheet` - Slide-up modal
- `ActionSheet` - iOS-style action picker
- `PullToRefresh` - Pull-to-refresh wrapper
- `SwipeableCard` - Swipeable card with actions

## Capacitor Plugins

### Installed Plugins
- `@capacitor/camera` - Photo uploads
- `@capacitor/filesystem` - File storage
- `@capacitor/share` - Share invoices/estimates
- `@capacitor/push-notifications` - Push alerts
- `@capacitor/status-bar` - Status bar theming
- `@capacitor/splash-screen` - App launch screen

### Usage Example
```typescript
import { Camera } from '@capacitor/camera';
import { Share } from '@capacitor/share';

// Take photo
const photo = await Camera.getPhoto({
  resultType: CameraResultType.Uri
});

// Share content
await Share.share({
  title: 'Invoice #12345',
  text: 'Check out this invoice',
  url: 'https://example.com/invoice/12345'
});
```

## Android Build

### Prerequisites
- Android Studio
- Java JDK 11+
- Android SDK

### Build Steps
1. Build web assets: `npm run build`
2. Sync with Android: `npm run cap:sync`
3. Open in Android Studio: `npm run cap:open:android`
4. Build APK or AAB from Android Studio

### Release Build
```bash
# In Android Studio:
# Build > Generate Signed Bundle/APK
# Select Android App Bundle (.aab) for Play Store
# Or APK for direct distribution
```

## Environment Variables

Create `.env.local` for environment-specific config:
```
VITE_API_URL=https://api.servicepro.com
VITE_ENV=production
```

## Differences from Desktop Version

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Navigation | Left sidebar | Bottom tabs |
| Tables | Data tables | Card lists |
| Modals | Centered dialogs | Bottom sheets |
| Forms | Single page | Multi-step |
| Actions | Button groups | Swipe gestures |
| Search | Top search bar | In-page search |

## Testing

### Browser Testing
- Chrome DevTools mobile emulation
- Responsive mode at 375px width
- Test touch events

### Device Testing
```bash
# Build and run on connected Android device
npm run build
npm run cap:sync
npm run cap:run:android
```

### Recommended Test Devices
- Android 10+ (API level 29+)
- Screen sizes: 5" to 6.5"
- Test on both low and high-end devices

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 500KB (gzipped)
- **60 FPS Scrolling**: Smooth scroll on mid-range devices

## Known Limitations

1. **Offline Mode**: Not yet implemented (planned)
2. **Push Notifications**: Basic setup only
3. **Biometric Auth**: Not implemented
4. **Deep Linking**: Not configured
5. **App Updates**: Manual only (no OTA)

## Roadmap

- [ ] Implement offline mode with local storage
- [ ] Add push notification handlers
- [ ] Implement biometric authentication
- [ ] Configure deep linking
- [ ] Add service worker for PWA mode
- [ ] Implement photo capture and upload
- [ ] Add signature capture for agreements
- [ ] Implement QR code scanning

## Deployment

### Google Play Store
1. Build release AAB: `npm run build && npm run cap:sync`
2. Open Android Studio: `npm run cap:open:android`
3. Build > Generate Signed Bundle
4. Upload to Google Play Console

### Direct Distribution (APK)
1. Build debug APK from Android Studio
2. Enable "Install from Unknown Sources" on device
3. Transfer APK and install

## Support

For issues or questions:
- Desktop version: `/servicepro-ui-visions`
- Mobile version: `/servicepro-ui-visions/mobile-version`

## License

Same as parent project.

---

**Built with ❤️ using React + Capacitor**


