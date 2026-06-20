// File: ogs-client/depot/electron/preload.mjs
import { contextBridge, ipcRenderer } from 'electron';

console.log("🚀 PRELOAD SCRIPT LOADED SUCCESSFULLY 🚀");

contextBridge.exposeInMainWorld('electron', {
    printReceipt: (data) => ipcRenderer.invoke('print-receipt', data),
    
    // Database API
    getAllProducts: () => ipcRenderer.invoke('get-all-products'),
    addProduct: (product) => ipcRenderer.invoke('add-product', product),
    createSale: (sale) => ipcRenderer.invoke('create-sale', sale),
    updateProduct: (product) => ipcRenderer.invoke('update-product', product),
    deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
    deleteSale: (id) => ipcRenderer.invoke('delete-sale', id),
    getSales: (startDate, endDate) => ipcRenderer.invoke('get-sales', startDate, endDate),
    // getAllSales REMOVED for performance
    getSalesPaginated: (params) => ipcRenderer.invoke('get-sales-paginated', params),
    getStockHistory: () => ipcRenderer.invoke('get-stock-history'),
    processReturn: (data) => ipcRenderer.invoke('process-return', data),
    
    // Sync API
    checkConnection: () => ipcRenderer.invoke('check-connection'),
    onSyncLog: (callback) => {
        const listener = (_event, value) => callback(value);
        ipcRenderer.on('sync-log', listener);
        return () => ipcRenderer.removeListener('sync-log', listener);
    },
});
