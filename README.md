<div align="center">
  <img src="./public/logo-sq.png" alt="Orion Orbit Logo" width="120" height="120" />
  <h1 align="center">Orion Orbit</h1>
  <p align="center">
    Offline-first Point of Sale &amp; Inventory Management System
    <br />
    Built with Electron · React · SQLite · Supabase
  </p>
  <p align="center">
    <strong>English</strong> &bull;
    <strong>اردو</strong>
  </p>
</div>

---

## Overview

**Orion Orbit** is a desktop POS (Point of Sale) and inventory management application designed for retail shops in Pakistan. It operates fully offline with a local SQLite database and optionally syncs to a Supabase cloud backend when connected.

The app features full **Urdu language support**, thermal receipt printing, barcode scanning, and comprehensive stock history tracking.

### Built For

- Retail stores & stationery shops
- Offline-first environments
- Bilingual (English/Urdu) point of sale
- Small to medium inventory management

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Desktop Shell** | [Electron](https://www.electronjs.org/) 42 |
| **Frontend** | [React](https://react.dev/) 19, [Vite](https://vite.dev/) 8 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) 4, [shadcn/ui](https://ui.shadcn.com/) |
| **Local Database** | [SQLite](https://www.sqlite.org/) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) |
| **Cloud Sync** | [Supabase](https://supabase.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Barcode** | [jsbarcode](https://github.com/lindell/JsBarcode) |
| **Spreadsheet Export** | [SheetJS (xlsx)](https://sheetjs.com/) |

---

## Features

### Point of Sale
- Product search and category filtering
- Cart management with quantity controls
- Multiple payment methods (Cash, Card, etc.)
- Discount application
- Thermal receipt printing
- Quick-sell sheet for fast checkout
- Keyboard shortcuts (F1: POS, F2: Inventory, F3: Reports)

### Inventory Management
- Add, edit, and delete products
- Barcode and category support
- Low stock and out-of-stock indicators
- Stock history with change tracking
- Manual stock adjustment logging

### Sales & Returns
- Complete sales history with pagination
- Date-range filtering and sorting
- Detailed sale receipts
- Cash returns and item exchange workflows
- Automatic stock restocking on returns
- Soft delete with audit trail

### Reporting & Analytics
- Daily revenue and profit summaries
- Sales trend charts
- Top-selling products
- Order counts and return rate tracking

### Cloud Sync (Optional)
- Supabase-based offline-first sync
- Automatic background sync every 2 minutes
- Conflict resolution (latest timestamp wins)
- Connection status indicator

### Bilingual Interface
- Full English and Urdu (اردو) translations
- Urdu font included for proper Nastaleeq rendering
- Configurable language in settings

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/orion-orbit.git
cd orion-orbit

# Install dependencies
npm install

# Start development (Vite + Electron concurrently)
npm run dev
```

The app starts Vite dev server on `localhost:5173` and launches the Electron window automatically.

### Production Build

```bash
npm run build
```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root (optional, only needed for cloud sync):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Sync Toggle

Cloud sync is disabled by default. To enable it, set `SYNC_ENABLED = true` in `electron/main.js`:

```js
const SYNC_ENABLED = true;
```

---

## Project Structure

```
orion-orbit/
├── electron/
│   ├── main.js              # Electron main process & IPC handlers
│   ├── preload.mjs          # Context bridge for renderer
│   ├── db/
│   │   ├── db.js            # SQLite initialization & CRUD operations
│   │   └── schema.js        # Drizzle ORM schema definitions
│   └── services/
│       └── supabase.js      # Cloud sync service
├── src/
│   ├── App.jsx              # Root component with state-based routing
│   ├── main.jsx             # React entry point
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── layout/          # AppLayout, AppSidebar
│   │   ├── dashboard/       # HomeDashboard, StatCard, ActionCard
│   │   ├── pos/             # POS module components
│   │   ├── sales/           # ReceiptDialog, ReturnDialog
│   │   └── inventory/       # ProductDialog, DeleteAlert
│   ├── context/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Route pages
│   ├── data/                # Static data / mock data
│   └── lib/                 # Utilities & translations
├── public/
│   ├── fonts/               # Urdu Nastaleeq font
│   ├── logo-sq.png
│   └── logo-white.png
├── supabase_trigger.sql     # Supabase trigger for updated_at
├── vite.config.js
└── components.json          # shadcn/ui configuration
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F1` | Open POS / Sales Page |
| `F2` | Open Inventory |
| `F3` | Open Reports |

---

## Database Schema

### Products
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Product name |
| `barcode` | TEXT | Unique barcode |
| `price` | REAL | Selling price |
| `stock` | INTEGER | Current stock count |
| `category` | TEXT | Product category |
| `sync_status` | TEXT | `pending`, `synced`, or `error` |

### Sales
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `total_amount` | REAL | Total sale amount |
| `payment_method` | TEXT | Cash, Card, etc. |
| `status` | TEXT | Completed, Returned, Exchanged |
| `created_at` | TIMESTAMP | Sale timestamp |

### Stock History
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `product_id` | UUID | Related product |
| `previous_stock` | INTEGER | Stock before change |
| `current_stock` | INTEGER | Stock after change |
| `change_amount` | INTEGER | Quantity change |
| `reason` | TEXT | Reason for change |

---

## Contributing

Contributions are welcome. Please open an issue first to discuss your proposed changes.

---

## License

Private · The Orion School

---

<div align="center">
  <sub>Built with ❤️ by The Orion School</sub>
</div>
