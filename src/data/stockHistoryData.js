// File: ogs-client/depot/src/data/stockHistoryData.js

export let stockHistoryLogs = [
  {
    id: 101,
    productName: "Ballpoint Pen Blue",
    productBarcode: "100000000001",
    previousStock: 50,
    currentStock: 48,
    change: -2,
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
  },
  {
    id: 102,
    productName: "Ballpoint Pen Blue",
    productBarcode: "100000000001",
    previousStock: 55,
    currentStock: 50,
    change: -5,
    timestamp: Date.now() - 3600000 * 5, // 5 hours ago
  },
  {
    id: 103,
    productName: "Ballpoint Pen Blue",
    productBarcode: "100000000001",
    previousStock: 10,
    currentStock: 55,
    change: 45,
    timestamp: Date.now() - 86400000 * 0.5, // 12 hours ago
  },
  {
    id: 1,
    productName: "Ballpoint Pen Blue",
    productBarcode: "100000000001",
    previousStock: 45,
    currentStock: 50,
    change: 5,
    timestamp: Date.now() - 86400000, // 1 day ago
  },
  {
    id: 2,
    productName: "Scientific Calculator",
    productBarcode: "100000000005",
    previousStock: 5,
    currentStock: 3,
    change: -2,
    timestamp: Date.now() - 3600000, // 1 hour ago
  },
  {
    id: 3,
    productName: "A4 Notebook Spiral",
    productBarcode: "100000000003",
    previousStock: 15,
    currentStock: 30,
    change: 15,
    timestamp: Date.now() - 172800000, // 2 days ago
  },
  {
    id: 4,
    productName: "Gel Pen Black",
    productBarcode: "100000000002",
    previousStock: 20,
    currentStock: 12,
    change: -8,
    timestamp: Date.now() - 259200000, // 3 days ago
  },
  {
    id: 5,
    productName: "Sticky Notes",
    productBarcode: "100000000004",
    previousStock: 50,
    currentStock: 75,
    change: 25,
    timestamp: Date.now() - 345600000, // 4 days ago
  },
  {
    id: 6,
    productName: "USB Flash Drive 32GB",
    productBarcode: "100000000016",
    previousStock: 22,
    currentStock: 18,
    change: -4,
    timestamp: Date.now() - 432000000, // 5 days ago
  },
  {
    id: 7,
    productName: "Whiteboard Marker Set",
    productBarcode: "100000000007",
    previousStock: 30,
    currentStock: 40,
    change: 10,
    timestamp: Date.now() - 518400000, // 6 days ago
  },
  {
    id: 8,
    productName: "Ergonomic Mouse",
    productBarcode: "100000000017",
    previousStock: 3,
    currentStock: 0,
    change: -3,
    timestamp: Date.now() - 604800000, // 7 days ago
  },
  {
    id: 9,
    productName: "Stapler Medium",
    productBarcode: "100000000006",
    previousStock: 10,
    currentStock: 20,
    change: 10,
    timestamp: Date.now() - 691200000, // 8 days ago
  },
  {
    id: 10,
    productName: "Paper Clips (100pk)",
    productBarcode: "100000000010",
    previousStock: 100,
    currentStock: 85,
    change: -15,
    timestamp: Date.now() - 777600000, // 9 days ago
  },
  {
    id: 11,
    productName: "Highlighter Pink",
    productBarcode: "100000000011",
    previousStock: 40,
    currentStock: 60,
    change: 20,
    timestamp: Date.now() - 864000000, // 10 days ago
  },
  {
    id: 12,
    productName: "Mechanical Pencil 0.5mm",
    productBarcode: "100000000018",
    previousStock: 35,
    currentStock: 28,
    change: -7,
    timestamp: Date.now() - 950400000, // 11 days ago
  },
];

/**
 * Adds a new entry to the stock history logs.
 * @param {Object} log - The log entry object.
 * @param {string} log.productName - Name of the product.
 * @param {string} log.productBarcode - Barcode/ID of the product.
 * @param {number} log.previousStock - Stock before change.
 * @param {number} log.currentStock - Stock after change.
 * @param {number} log.change - The difference (positive or negative).
 */
export const addStockLog = (log) => {
  const newLog = {
    id: stockHistoryLogs.length + 1,
    ...log,
    timestamp: Date.now(),
  };
  // Prepend to show newest first
  stockHistoryLogs = [newLog, ...stockHistoryLogs];
};
