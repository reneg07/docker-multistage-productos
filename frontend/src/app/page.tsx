"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Product } from "@/types/product";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getHealthStatus,
} from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { ProductFormModal } from "@/components/ProductFormModal";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const DEFAULT_CATEGORIES = [
  "Electrónica",
  "Periféricos",
  "Computadoras",
  "Audio",
  "Accesorios",
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Estado del backend
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToView, setProductToView] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Notificación tipo toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Cargar productos
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al conectar con el servidor.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Comprobar salud del backend
  const checkBackendHealth = useCallback(async () => {
    try {
      await getHealthStatus();
      setIsHealthy(true);
    } catch {
      setIsHealthy(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    checkBackendHealth();

    // Comprobación periódica cada 30 segundos
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, [loadProducts, checkBackendHealth]);

  // Lista consolidada de categorías
  const categories = useMemo(() => {
    const fromProducts = products.map((p) => p.category.trim()).filter(Boolean);
    const combined = Array.from(new Set([...DEFAULT_CATEGORIES, ...fromProducts]));
    return combined.sort();
  }, [products]);

  // Filtrado reactivo en el frontend (complementario a la búsqueda de la API)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  // Handlers para modales
  const handleOpenCreate = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (product: Product) => {
    setProductToView(product);
  };

  const handleOpenDelete = (product: Product) => {
    setProductToDelete(product);
  };

  // Handlers de mutación
  const handleSaveProduct = async (formData: FormData) => {
    if (productToEdit) {
      const updated = await updateProduct(productToEdit.id, formData);
      setProducts((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      showToast("Producto actualizado exitosamente.");
    } else {
      const created = await createProduct(formData);
      setProducts((prev) => [created, ...prev]);
      showToast("Producto registrado exitosamente.");
    }
  };

  const handleConfirmDelete = async (id: number) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((item) => item.id !== id));
    showToast("Producto eliminado exitosamente.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <Navbar
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        onOpenCreate={handleOpenCreate}
        isHealthy={isHealthy}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
              toast.type === "success"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20"
                : "bg-red-600 text-white border-red-500 shadow-red-500/20"
            }`}
          >
            {toast.type === "success" ? (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Catálogo de Productos
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {filteredProducts.length === products.length
                ? `Mostrando ${products.length} producto${products.length === 1 ? "" : "s"}`
                : `Mostrando ${filteredProducts.length} de ${products.length} producto${products.length === 1 ? "" : "s"}`}
              {selectedCategory !== "all" && (
                <span className="ml-2 font-medium text-blue-600">
                  • Categoría: {selectedCategory}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                loadProducts();
                checkBackendHealth();
              }}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-2xs transition-colors"
              title="Refrescar catálogo"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="font-bold">Error al comunicar con la API REST:</p>
              <p className="mt-0.5">{error}</p>
            </div>
            <button
              onClick={loadProducts}
              className="px-2.5 py-1 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Dynamic Display */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onView={handleOpenDetail}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            isFiltered={Boolean(search.trim() || selectedCategory !== "all")}
            onClearFilters={() => {
              setSearch("");
              setSelectedCategory("all");
            }}
            onOpenCreate={handleOpenCreate}
          />
        )}
      </main>

      {/* Modales */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveProduct}
        productToEdit={productToEdit}
        categories={categories}
      />

      <ProductDetailModal
        product={productToView}
        onClose={() => setProductToView(null)}
        onEdit={handleOpenEdit}
      />

      <DeleteConfirmModal
        product={productToDelete}
        isOpen={Boolean(productToDelete)}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        <p>
          Ingeniería de Imágenes Eficientes • Next.js 16 + Laravel 12 + MySQL 8.0 • Docker Multi-stage
        </p>
      </footer>
    </div>
  );
}
