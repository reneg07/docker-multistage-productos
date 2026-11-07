"use client";

import React from "react";

interface EmptyStateProps {
  isFiltered: boolean;
  onClearFilters: () => void;
  onOpenCreate: () => void;
}

export function EmptyState({
  isFiltered,
  onClearFilters,
  onOpenCreate,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 shrink-0 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
        {isFiltered ? (
          <svg className="w-8 h-8 shrink-0" width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ) : (
          <svg
            className="w-8 h-8 shrink-0"
            width="32"
            height="32"
            style={{ width: "32px", height: "32px" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-bold text-gray-900">
        {isFiltered ? "No se encontraron coincidencias" : "No hay productos registrados"}
      </h3>

      <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
        {isFiltered
          ? "No se hallaron productos que coincidan con los criterios de búsqueda o categoría seleccionados."
          : "Comienza registrando tu primer producto en el catálogo utilizando el botón inferior."}
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        {isFiltered ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Limpiar filtros
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Registrar Producto
          </button>
        )}
      </div>
    </div>
  );
}

