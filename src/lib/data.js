// File: ogs-client/depot/src/lib/data.js
export const products = [
  {
    id: 1,
    name: "Ballpoint Pen Blue",
    price: 15,
    category: "Writing",
    barcode: "8901234567890",
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVufGVufDB8fDB8fHww",
  },
  {
    id: 2,
    name: "Gel Pen Black",
    price: 30,
    category: "Writing",
    barcode: "8901234567891",
    image: "https://images.unsplash.com/photo-1565463660555-d3c2244bd541?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    id: 3,
    name: "A4 Notebook Spiral",
    price: 150,
    category: "Paper",
    barcode: "8901234567892",
    image: "https://images.unsplash.com/photo-1531346878377-a513bc957374?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    id: 4,
    name: "Sticky Notes",
    price: 80,
    category: "Paper",
    barcode: "8901234567893",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    id: 5,
    name: "Scientific Calculator",
    price: 1200,
    category: "Electronics",
    barcode: "8901234567894",
    image: "https://images.unsplash.com/photo-1594729095022-e2f6d2eece9c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    id: 6,
    name: "Stapler Medium",
    price: 250,
    category: "Office",
    barcode: "8901234567895",
    image: "https://images.unsplash.com/photo-1622359670603-67a68e6f1f8b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    id: 7,
    name: "Whiteboard Marker Set",
    price: 200,
    category: "Writing",
    barcode: "8901234567896",
    image: "https://images.unsplash.com/photo-1594911776518-d4444a1da518?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
  {
    id: 8,
    name: "Correction Tape",
    price: 120,
    category: "Office",
    barcode: "8901234567897",
    image: "https://images.unsplash.com/photo-1533230303020-ba124806aeb7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  },
];

export const categories = ["All", "Writing", "Paper", "Electronics", "Office"];

// Mock stats for dashboard
export const mockStats = {
  todaysSales: 12450,
  lastTransaction: 850,
  lowStockCount: 3,
  pendingReturns: 1, // Added for returns badge
};

// Helper to get date relative to today
const getRelativeDate = (daysAgo, hours = 10, minutes = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const MOCK_SALES = [
  {
    id: "ORD-001",
    date: getRelativeDate(0, 10, 30), // Today 10:30 AM
    items: [
      { id: 1, name: "Ballpoint Pen Blue", price: 15, quantity: 2 },
      { id: 3, name: "A4 Notebook Spiral", price: 150, quantity: 1 }
    ],
    total: 180,
    status: "Completed",
    paymentMethod: "Cash"
  },
  {
    id: "ORD-002",
    date: getRelativeDate(0, 12, 15), // Today 12:15 PM
    items: [
        { id: 5, name: "Scientific Calculator", price: 1200, quantity: 1 }
    ],
    total: 1200,
    status: "Completed",
     paymentMethod: "Card"
  },
  {
    id: "ORD-003",
    date: getRelativeDate(1, 14, 45), // Yesterday
    items: [
        { id: 2, name: "Gel Pen Black", price: 30, quantity: 5 },
        { id: 4, name: "Sticky Notes", price: 80, quantity: 2 }
    ],
    total: 310,
    status: "Returned",
    paymentMethod: "Cash"
  },
  {
    id: "ORD-004",
    date: getRelativeDate(1, 16, 20), // Yesterday
    items: [
        { id: 6, name: "Stapler Medium", price: 250, quantity: 1 },
        { id: 7, name: "Whiteboard Marker Set", price: 200, quantity: 1 }
    ],
    total: 450,
    status: "Completed",
    paymentMethod: "Cash"
  },
  {
    id: "ORD-005",
    date: getRelativeDate(2, 9, 0), // 2 Days Ago
    items: [
        { id: 8, name: "Correction Tape", price: 120, quantity: 1 }
    ],
    total: 120,
    status: "Completed",
    paymentMethod: "Cash"
  }
];
