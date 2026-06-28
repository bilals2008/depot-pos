# Orion Orbit

A modern, cross-platform **Desktop Point-of-Sale (POS) & Inventory Management System** built with Electron, React 19, and SQLite. Designed for retail environments with bilingual support (English/Urdu), offline-first architecture, and optional cloud synchronization.

---

## 🚀 Features

### Point of Sale
- **Keyboard-first workflow** — F1/F2/F3 shortcuts for instant navigation
- **Barcode scanning** — jsbarcode integration for product lookup
- **Cart management** — Real-time totals, quantity controls, discount support
- **Multiple payment methods** — Cash, Card, Mobile wallet
- **Thermal receipt printing** — 58mm ESC/POS compatible
- **Returns & Exchanges** — Full/partial returns with reason tracking

### Inventory Management
- **Product CRUD** — Name, barcode, price, stock, category
- **Stock tracking** — Real-time levels with history audit trail
- **Low-stock alerts** — Visual indicators on dashboard
- **Bulk import/export** — Excel (xlsx) support via SheetJS
- **Category organization** — Flexible product grouping

### Reporting & Analytics
- **Sales dashboard** — Revenue, transactions, average order value
- **Sales history** — Paginated, searchable, date-filtered
- **Stock movement history** — Complete audit trail
- **Recharts visualizations** — Area, bar, and pie charts
- **Export to Excel** — One-click report downloads

### Technical Highlights
- **Offline-first** — SQLite via better-sqlite3 + Drizzle ORM
- **Optional cloud sync** — Supabase integration (toggleable)
- **Bilingual UI** — English/Urdu with RTL support & Nastaleeq font
- **Dark/Light themes** — System-aware with manual toggle
- **Soft deletes** — Audit-safe data retention
- **Auto-updates ready** — Electron builder compatible

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Desktop Shell** | Electron 42 (main + preload) |
| **UI Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS 4 (`@theme inline` tokens) |
| **Component Library** | shadcn/ui (Radix UI primitives) |
| **Database** | SQLite via better-sqlite3 |
| **ORM** | Drizzle ORM |
| **Cloud Sync** | Supabase (optional, off by default) |
| **Charts** | Recharts |
| **Icons** | lucide-react |
| **State Management** | React Context |
| **Routing** | State-based (`activePath`) — no React Router |
| **Barcodes** | jsbarcode |
| **Export** | SheetJS (xlsx) |
| **Forms** | React Hook Form + Zod |
| **Notifications** | sonner |

---

## 📦 Project Structure

```
orion-orbit/
├── electron/                    # Main process (Node.js)
│   ├── main.js                  # Entry point, window management, IPC
│   ├── preload.mjs              # Secure IPC bridge (contextBridge)
│   ├── db/
│   │   ├── db.js                # Drizzle instance & queries
│   │   └── schema.js            # Database schema (Drizzle)
│   └── services/
│       └── supabase.js          # Cloud sync service
├── src/                         # Renderer process (React)
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives (DO NOT MODIFY)
│   │   ├── layout/              # AppLayout, Sidebar, Header
│   │   ├── pos/                 # POS-specific components
│   │   ├── inventory/           # Inventory-specific components
│   │   ├── sales/               # Sales-specific components
│   │   ├── dashboard/           # Dashboard widgets
│   │   └── WelcomeScreen.jsx
│   ├── context/
│   │   ├── CartContext.jsx      # POS cart state
│   │   ├── SalesContext.jsx     # Sales data & actions
│   │   ├── SettingsContext.jsx  # App settings (lang, theme, etc.)
│   │   ├── ThemeContext.jsx     # Dark/light mode
│   │   └── NavigationContext.jsx # History stack
│   ├── hooks/
│   │   ├── useProducts.js       # Product data & mutations
│   │   ├── useReports.js        # Analytics queries
│   │   └── useStockHistory.js   # Stock movement queries
│   ├── pages/                   # Route-level components
│   │   ├── HomePage.jsx
│   │   ├── SalesPage.jsx
│   │   ├── InventoryPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── ReturnsPage.jsx
│   │   ├── SalesHistoryPage.jsx
│   │   ├── StockHistoryPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── SetupPage.jsx
│   ├── lib/
│   │   ├── utils.js             # cn() className merger
│   │   ├── translations.js      # EN/UR translation map
│   │   └── data.js              # Static/mock data
│   ├── index.css                # Tailwind v4 + @theme tokens
│   ├── App.jsx                  # Root component, routing, providers
│   └── main.jsx                 # React entry point
├── public/                      # Static assets
│   ├── fonts/                   # Jameel Noori Nastaleeq
│   └── logo-sq.png
├── components.json              # shadcn/ui config
├── vite.config.js               # Vite + Tailwind + aliases
├── eslint.config.js
└── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** 20+
- **npm** 10+ (or pnpm/yarn)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd orion-orbit

# Install dependencies
npm install

# Start development (Vite + Electron with hot reload)
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server + Electron (hot reload) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview Vite build |
| `npm run electron` | Run packaged Electron app |
| `npm run lint` | ESLint check |

---

## ⚙️ Configuration

### Environment Variables

Create `.env` in project root (see `electron/main.js` for Supabase config):

```env
# Supabase (optional - sync disabled by default)
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Enable Cloud Sync

Edit `electron/main.js`:

```javascript
// Line 12: Change to true
const SYNC_ENABLED = true;
```

Sync runs automatically every 2 minutes when enabled.

### Database Location

SQLite database stored at:
- **Windows**: `%APPDATA%/Orion Orbit/database.sqlite`
- **macOS**: `~/Library/Application Support/Orion Orbit/database.sqlite`
- **Linux**: `~/.config/Orion Orbit/database.sqlite`

---

## 🎨 Design System

### Semantic Tokens Only

**Never use hardcoded colors, spacing, or radii.** Use Tailwind v4 semantic tokens defined in `src/index.css`:

```jsx
// ✅ Correct
<div className="bg-background text-foreground border-border" />
<Button variant="destructive" className="rounded-lg" />
<div className="text-muted-foreground" />

// ❌ Wrong
<div className="bg-white text-black border-gray-200" />
<Button className="bg-red-500" />
<div className="text-gray-500" />
```

### Available Tokens

| Token | Purpose |
|-------|---------|
| `bg-background` / `text-foreground` | Primary surface & text |
| `bg-card` / `text-card-foreground` | Card surfaces |
| `bg-popover` / `text-popover-foreground` | Popovers/dropdowns |
| `bg-primary` / `text-primary-foreground` | Primary actions |
| `bg-secondary` / `text-secondary-foreground` | Secondary actions |
| `bg-muted` / `text-muted-foreground` | De-emphasized content |
| `bg-accent` / `text-accent-foreground` | Hover/focus states |
| `bg-destructive` / `text-destructive-foreground` | Destructive actions |
| `border-border` / `border-input` | Borders |
| `ring-ring` | Focus rings |
| `rounded-[radius]` via `--radius` | Border radius |
| `chart-1` … `chart-5` | Chart colors |

### shadcn/ui Components

All primitives in `src/components/ui/`. Import and compose — **never modify**:

```jsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
```

Use `cn()` from `@/lib/utils` for className merging.

---

## 🌐 Bilingual Support (EN/UR)

### Translations
Defined in `src/lib/translations.js` with flat key structure:

```javascript
export const translations = {
  en: { "pos.title": "Point of Sale", ... },
  ur: { "pos.title": "پوائنٹ آف سیل", ... }
};
```

### Usage
```jsx
const { t, language } = useSettings();
<button>{t("pos.checkout")}</button>
```

### Urdu Rendering
- **Font**: "Jameel Noori Nastaleeq" (bundled in `public/fonts/`)
- **Direction**: RTL via `html[lang="ur"]`
- **Class**: Apply `text-urdu` or `dir="rtl"` for Urdu text

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **F1** | Navigate to POS (`/sales`) |
| **F2** | Navigate to Inventory (`/inventory`) |
| **F3** | Navigate to Reports (`/reports`) |

Defined in `src/App.jsx` global keydown listener.

---

## 🗄 Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `products` | Product catalog (id, name, barcode, price, stock, category, sync fields) |
| `sales` | Sale records (id, totalAmount, paymentMethod, status, sync fields) |
| `sale_items` | Line items per sale (saleId, productId, quantity, priceAtSale) |
| `stock_history` | Audit trail (productId, previousStock, currentStock, changeAmount, reason) |
| `sync_state` | Key-value checkpoints for sync resume |

### Soft Deletes
All tables use `deletedAt` timestamp — **never hard delete**. Queries filter `WHERE deletedAt IS NULL`.

---

## 🔌 Electron IPC API

Renderer → Main via `window.electron`:

```javascript
// Products
window.electron.getAllProducts()
window.electron.addProduct({ id, name, barcode, price, stock, category })
window.electron.updateProduct({ id, name, barcode, price, stock, category })
window.electron.deleteProduct(id)

// Sales
window.electron.createSale({ id, totalAmount, paymentMethod, items })
window.electron.getSales(startDate, endDate)
window.electron.getSalesPaginated({ page, pageSize, sortBy, sortOrder, searchTerm })
window.electron.deleteSale(id)

// Inventory
window.electron.getStockHistory()

// Returns
window.electron.processReturn({ saleId, returnedItems, exchangeItems, returnMode, reason })

// Printing
window.electron.printReceipt(receiptData)

// Sync
window.electron.checkConnection()
```

---

## 📦 Build & Distribution

### Development Build
```bash
npm run build
npm run electron  # Runs from dist/
```

### Production Packaging
Configure `package.json` → `build` section for [electron-builder](https://www.electron.build/):

```json
"build": {
  "appId": "com.orion.orbit",
  "productName": "Orion Orbit",
  "files": ["dist/**/*", "electron/**/*"],
  "extraResources": ["public/**/*"],
  "win": { "target": "nsis" },
  "mac": { "target": "dmg" },
  "linux": { "target": "AppImage" }
}
```

Then:
```bash
npx electron-builder
```

---

## 🧪 Code Quality

```bash
# Lint
npm run lint

# Type checking (if TypeScript added)
# npx tsc --noEmit
```

### Conventions
- **Imports**: React → libraries → shadcn → app components → local
- **Aliases**: `@/` maps to `src/` (configured in `vite.config.js`)
- **Components**: Feature folders under `src/components/{feature}/`
- **Context**: Providers wrap `AppContent` in `App.jsx`
- **Routing**: State-based via `activePath` — no React Router

---

## 🤝 Contributing

Internal project — direct commits to `main` with descriptive messages.

```bash
git add -A
git commit -m "feat(scope): description"
git push
```

---

## 📞 Support

For issues or questions, contact **Muhammad Bilal Hassan**.