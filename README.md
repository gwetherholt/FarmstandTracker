# Port Orchard Farm Stand

A mobile-first Progressive Web App for tracking egg preorders at a small farm stand in Port Orchard, WA. Built for Sunday-only operations where customers DM orders throughout the week.

## Screenshots

_Coming soon_

## Features

- **Sunday-based Order Board** - View and manage preorders organized by upcoming Sunday dates
- **Quick Order Entry** - Fast order logging with customer autocomplete, quantity steppers, and minimal taps
- **Prep Summary** - At-a-glance totals for eggs needed, expected revenue, and pickup status
- **Carton Return Tracking** - Track returned cartons with automatic $1 discount
- **Payment Tracking** - Log payments as Orange Lockbox (cash) or Venmo
- **Offline Support** - Works fully offline after first load via service worker
- **Installable PWA** - Add to home screen on Android for a native app experience

## Products & Pricing

| Product | Price per Half-Dozen |
|---------|---------------------|
| Rainbow Chicken Eggs | $2 |
| Duck Eggs | $3 |
| Fertile Goose Eggs | $6 |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install and Run

```bash
git clone https://github.com/your-username/farmstand-tracker.git
cd farmstand-tracker
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

### Install on Android as a PWA

1. Open the app URL in Chrome on your Android device
2. Tap the menu (three dots) in the top-right corner
3. Tap "Add to Home Screen"
4. The app will appear on your home screen and work offline

## Tech Stack

- **React 19** + **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Dexie.js** - IndexedDB wrapper for offline data storage
- **vite-plugin-pwa** - PWA manifest and service worker generation
- **Playfair Display** + **Inter** - Typography (Google Fonts)

## Project Structure

```
src/
  components/   # React components (OrderCard, OrderForm, PrepSummary, etc.)
  hooks/        # Custom hooks (useOrders, useCustomers)
  db/           # Dexie.js database setup
  types/        # TypeScript type definitions
  utils/        # Date helpers, pricing calculations
```

## Future Roadmap

- Cloud sync (back up data across devices)
- DM auto-reply integration (paste customer message, get draft reply with prices & hours)
- Sales analytics and trends (which eggs sell most, weekly/monthly revenue)
- Multi-product support (honey, produce, etc.)

## License

MIT
