// File: ogs-client/depot/electron/main.js
import 'dotenv/config';
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import { addProduct, createSale, deleteProduct, deleteSale, getAllProducts, getSales, getStockHistory, initDb, processReturn, updateProduct } from './db/db.js';
import { syncService } from './services/supabase.js';

// ===== SYNC TOGGLE =====
// Set to true to re-enable cloud sync
const SYNC_ENABLED = false;
// ========================

// ESM replacement for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.setName("Orion Orbit");

if (process.platform === "darwin") {
  app.dock.setIcon(path.join(__dirname, "../public/logo-sq.png"));
}

let mainWindow;
let printWindow; // Reusable hidden window for printing

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Orion Orbit",
    icon: path.join(__dirname, "../public/logo-sq.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false 
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL("http://localhost:5173");
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  mainWindow = win;

  // Initialize Hidden Print Window
  printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
}

app.whenReady().then(async () => {
  // Initialize Database
  try {
    initDb(app.getPath('userData'));
    console.log("Database initialized successfully");

    // Helper to wrap DB calls safely
    console.log("Registering IPC handlers...");
    ipcMain.handle('get-all-products', async () => {
      try { return getAllProducts(); } 
      catch (e) { console.error(e); throw e; }
    });

    ipcMain.handle('add-product', async (event, product) => {
       try { return addProduct(product); }
       catch (e) { console.error(e); throw e; }
    });

    ipcMain.handle('check-connection', async () => {
        if (!SYNC_ENABLED) return false;
        return await syncService.checkConnection();
    });

    ipcMain.handle('create-sale', async (event, sale) => {
       try { return createSale(sale); }
       catch (e) { console.error(e); throw e; }
    });

    ipcMain.handle('update-product', async (event, product) => {
      try { return updateProduct(product); }
      catch (e) { console.error(e); throw e; }
   });

   ipcMain.handle('delete-product', async (event, id) => {
      try { return deleteProduct(id); }
      catch (e) { console.error(e); throw e; }
   });

   ipcMain.handle('delete-sale', async (event, id) => {
      try { return deleteSale(id); }
      catch (e) { console.error(e); throw e; }
   });

   ipcMain.handle('get-sales', async (event, startDate, endDate) => {
      try { return getSales(startDate, endDate); }
      catch (e) { console.error(e); throw e; }
   });

   // Removed: get-all-sales

   ipcMain.handle('get-sales-paginated', async (event, params) => {
    try { 
        const { getSalesPaginated } = await import('./db/db.js');
        return getSalesPaginated(params); 
    }
    catch (e) { console.error(e); throw e; }
 });

 ipcMain.handle('get-stock-history', async () => {
    try { return getStockHistory(); }
    catch (e) { console.error(e); throw e; }
 });

 ipcMain.handle('process-return', async (event, data) => {
    try { return processReturn(data); }
    catch (e) { console.error(e); throw e; }
 });

  } catch (err) {
    console.error("Failed to initialize database:", err);
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Reusable Printing Logic
  ipcMain.handle("print-receipt", async (event, receiptData) => {
    if (!printWindow) {
        throw new Error("Print window not initialized");
    }

    const receiptHTML = `
      <html>
        <head>
          <style>
            body { 
                width: 58mm; 
                margin: 0; 
                padding: 5px; 
                font-family: 'Courier New', monospace; 
                font-size: 12px;
            }
            .header { text-align: center; margin-bottom: 10px; }
            .divider { border-top: 1px dashed black; margin: 5px 0; }
            .row { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="bold">Orion Orbit by The Orion School</div>
            <div>Shop #12, Market Area</div>
          </div>
          <div class="divider"></div>
          <div>Order: ${receiptData.id}</div>
          <div>Date: ${new Date(receiptData.date).toLocaleString()}</div>
          <div class="divider"></div>
          ${receiptData.items.map(item => `
            <div class="row">
              <div style="width: 60%">${item.name}</div>
              <div style="width: 15%">${item.quantity}</div>
              <div style="width: 25%; text-align: right">${item.price * item.quantity}</div>
            </div>
          `).join('')}
          <div class="divider"></div>
          <div class="row bold">
            <div>TOTAL</div>
            <div>PKR ${receiptData.total}</div>
          </div>
          <div class="divider"></div>
          <div style="text-align: center; margin-top: 10px;">Thank You!</div>
          <div style="margin-top: 10px; border-top: 1px dashed black; padding-top: 5px; text-align: center;">
            <div class="bold" style="margin-bottom: 2px;">Terms & Conditions</div>
            <div>Pencils and pens are not returnable after use.</div>
          </div>
        </body>
      </html>
    `;

    await printWindow.loadURL("data:text/html;charset=utf-8," + encodeURI(receiptHTML));

    try {
        const printers = await printWindow.webContents.getPrintersAsync();
        
        await printWindow.webContents.print({
            silent: true,
            printBackground: false,
            deviceName: printers.length > 0 ? printers[0].name : '', 
            margins: { marginType: 'none' }
        });
        
        return { success: true };
    } catch (error) {
        console.error("Print failed:", error);
        throw error;
    }
  });

  // Auto-Sync Background Job
  if (SYNC_ENABLED) {
    const triggerInitialSync = async () => {
      console.log("Checking Cloud Connection...");
      const connected = await syncService.checkConnection();
      if (connected) {
          console.log("Cloud connected. pushing/pulling changes...");
          await syncService.pushChanges();
          await syncService.pullChanges();
      }
    };
    
    triggerInitialSync();

    // Schedule Sync every 2 minutes
    setInterval(async () => {
          const connected = await syncService.checkConnection();
          if (mainWindow) {
              mainWindow.webContents.send('sync-log', connected ? 'Online' : 'Offline');
          }
          
          if (connected) {
              let hasMore = true;
              let cycleCount = 0;
              const maxCycles = 5; // Prevent infinite loop if something is stuck

              while (hasMore && cycleCount < maxCycles) {
                  cycleCount++;

                  // 1. Push Local Changes
                  const pushResult = await syncService.pushChanges();
                  
                  // 2. Pull Remote Changes
                  const pullResult = await syncService.pullChanges();

                  // 3. Log results
                  let msgParts = [];
                  if (pushResult && pushResult.success) {
                      if (pushResult.pushedSales > 0) msgParts.push(`${pushResult.pushedSales} sales synced`);
                      if (pushResult.pushedProducts > 0) msgParts.push(`${pushResult.pushedProducts} products synced`);
                  }
                  if (pullResult && pullResult.success && pullResult.pulledProducts > 0) {
                       msgParts.push(`${pullResult.pulledProducts} products updated from cloud`);
                  }

                  if (msgParts.length > 0 && mainWindow) {
                       mainWindow.webContents.send('sync-log', `Synced: ${msgParts.join(', ')}`);
                  }

                  hasMore = (pushResult?.hasMore) || (pullResult?.hasMore);
                  
                  // Small delay between deep sync batches to allow UI heartbeat
                  if (hasMore) await new Promise(r => setTimeout(r, 500));
              }
          }
      }, 2 * 60 * 1000); // 2 minutes
  } else {
      console.log("Cloud sync is DISABLED. Set SYNC_ENABLED = true in main.js to enable.");
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
