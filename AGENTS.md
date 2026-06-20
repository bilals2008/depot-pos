# AGENTS.md — Orion Orbit

## Project Identity

- **Name:** Orion Orbit
- **Type:** Desktop POS & Inventory Management System
- **Owner:** Muhammad Bilal Hassan

## Tech Stack

| Concern | Choice |
|---------|--------|
| Desktop Shell | Electron 42 (main + preload) |
| UI Library | React 19 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 (`@theme inline` tokens) |
| Component Library | shadcn/ui (Radix primitives) |
| Local DB | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| Cloud Sync | Supabase (optional, toggleable) |
| Charts | Recharts |
| Icons | lucide-react |
| State Mgmt | React Context |
| Routing | State-based (`activePath`), no React Router |
| Barcodes | jsbarcode |
| Export | SheetJS (xlsx) |

## Code Conventions

### 1. Semantic Tokens Only — NO Hardcoded Values

Never use raw color values, border-radius, shadows, or spacing. Use only Tailwind v4 semantic tokens defined in `src/index.css` `@theme inline` block.

**Correct:**
```jsx
<div className="bg-background text-foreground border-border" />
<Button variant="destructive" className="rounded-lg" />
<div className="text-muted-foreground" />
```

**Wrong:**
```jsx
<div className="bg-white text-black border-gray-200" />
<Button className="bg-red-500" />
<div className="text-gray-500" />
```

Available semantic tokens (see `:root` / `.dark` in `index.css`):

| Token | Usage |
|-------|-------|
| `bg-background` | Page/surface background |
| `text-foreground` | Primary text |
| `bg-card` / `text-card-foreground` | Card surfaces |
| `bg-popover` / `text-popover-foreground` | Popovers/dropdowns |
| `bg-primary` / `text-primary-foreground` | Primary actions |
| `bg-secondary` / `text-secondary-foreground` | Secondary actions |
| `bg-muted` / `text-muted-foreground` | Muted/de-emphasized |
| `bg-accent` / `text-accent-foreground` | Hover/focus states |
| `bg-destructive` / `text-destructive-foreground` | Destructive actions |
| `border-border` / `border-input` | Borders |
| `ring-ring` | Focus rings |
| `bg-sidebar-*` / `text-sidebar-*` | Sidebar specific |
| `rounded-[radius]` via `--radius` var | Border radius |

For chart colors, use `chart-1` through `chart-5` tokens.

### 2. shadcn/ui Components

All UI primitives live in `src/components/ui/`. Import and compose them — never write raw Radix or custom HTML for dialogs, forms, dropdowns, etc.

```jsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
```

Use `cn()` from `@/lib/utils` for className merging.

### 3. Import Conventions

- Use `@/` alias for `src/` (configured in `vite.config.js`)
- Named exports for shadcn components, default exports for app-specific components
- Group imports: React → libraries → shadcn → app components → local

```jsx
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/SettingsContext";
```

### 4. Component Patterns

- **Feature components:** `src/components/{feature}/` (pos/, inventory/, sales/, dashboard/, layout/)
- **Pages:** `src/pages/` — single file per route
- **Keep shadcn components untouched** — never modify files in `src/components/ui/`
- Use `React.forwardRef` for reusable components
- Destructure props at the parameter level

### 5. State Management

- **React Context** for global state (CartContext, SalesContext, SettingsContext, ThemeContext, NavigationContext)
- Context providers wrap `AppContent` in `App.jsx`
- Custom hooks in `src/hooks/` for reusable logic
- Local state with `useState` / `useReducer` for component-specific state

### 6. Routing

State-based routing via `activePath` string — **no React Router**. Routes defined in `App.jsx`:

| Path | Page Component |
|------|---------------|
| `/` | HomePage |
| `/sales` | SalesPage |
| `/inventory` | InventoryPage |
| `/reports` | ReportsPage |
| `/returns` | ReturnsPage |
| `/sales-history` | SalesHistoryPage |
| `/stock-history` | StockHistoryPage |

Navigation via `onNavigate` prop or `setActivePath`.

### 7. Electron IPC

Database operations go through Electron IPC bridge exposed on `window.electron`:

```js
window.electron.getAllProducts();
window.electron.addProduct({ id, name, barcode, price, stock, category });
window.electron.createSale({ id, totalAmount, paymentMethod, items });
window.electron.updateProduct({ id, name, barcode, price, stock, category });
window.electron.deleteProduct(id);
window.electron.deleteSale(id);
window.electron.getSales(startDate, endDate);
window.electron.getSalesPaginated({ page, pageSize, sortBy, sortOrder, searchTerm });
window.electron.getStockHistory();
window.electron.processReturn({ saleId, returnedItems, exchangeItems, returnMode, reason });
window.electron.printReceipt(receiptData);
window.electron.checkConnection();
```

### 8. Bilingual Support

- Translations in `src/lib/translations.js` (en / ur)
- Access via `useSettings().t("key")`
- Urdu: `html[lang="ur"]` with Nastaleeq font family, RTL direction
- Include `text-urdu` class or `dir="rtl"` for Urdu text
- Urdu font: "Jameel Noori Nastaleeq" (bundled in `public/fonts/`)

### 9. Database Schema

SQLite with Drizzle ORM — schema in `electron/db/schema.js`:

- **products** — `id`, `name`, `barcode`, `price`, `stock`, `category`, `syncStatus`, `deletedAt`
- **sales** — `id`, `totalAmount`, `paymentMethod`, `status`, `syncStatus`, `deletedAt`
- **sale_items** — `id`, `saleId`, `productId`, `quantity`, `priceAtSale`, `deletedAt`
- **stock_history** — `id`, `productId`, `productName`, `previousStock`, `currentStock`, `changeAmount`, `reason`, `syncStatus`
- **sync_state** — key-value store for sync checkpoints

Soft deletes via `deletedAt` field — never hard-delete.

### 10. Cloud Sync

Supabase sync is **off by default**. Toggle via `SYNC_ENABLED` in `electron/main.js`.
Sync service in `electron/services/supabase.js`.
Automatic 2-minute interval when enabled.

### 11. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| F1 | Navigate to /sales |
| F2 | Navigate to /inventory |
| F3 | Navigate to /reports |

Defined in `App.jsx` global keydown listener.

### 12. File Organization

```
electron/          — Main process, IPC, DB, sync
src/
  components/ui/   — shadcn primitives (DO NOT MODIFY)
  components/{feature}/ — Feature components
  context/         — React context providers
  hooks/           — Custom hooks
  pages/           — Route pages
  data/            — Static/mock data
  lib/             — Utilities, translations
public/            — Static assets, fonts
```
