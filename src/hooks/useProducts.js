// File: ogs-client/depot/src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            if (window.electron) {
                const data = await window.electron.getAllProducts();
                setProducts(data);
            } else {
                console.warn("Electron API not found. Using mock data or empty state.");
                setProducts([]);
            }
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const addProduct = async (product) => {
        try {
            if (!window.electron) throw new Error("Electron API not found");
            const newProduct = {
                id: crypto.randomUUID(),
                ...product
            };
            await window.electron.addProduct(newProduct);
            await fetchProducts(); // Refresh list
            return { success: true };
        } catch (err) {
            console.error("Error adding product:", err);
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const updateProduct = async (product) => {
        try {
           if (!window.electron) throw new Error("Electron API not found");
           await window.electron.updateProduct(product);
           await fetchProducts();
           return { success: true };
        } catch (err) {
            console.error("Error updating product:", err);
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    const deleteProduct = async (id) => {
        try {
            if (!window.electron) throw new Error("Electron API not found");
            await window.electron.deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id)); // Optimistic update
            return { success: true };
        } catch (err) {
            console.error("Error deleting product:", err);
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        products,
        loading,
        error,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct
    };
};
