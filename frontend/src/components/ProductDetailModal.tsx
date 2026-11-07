"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onEdit,
}: ProductDetailModalProps) {
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
              ID #{product.id}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {product.category}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Large Image Preview */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
            {product.image_url && !imageError ? (
              <img
                src={product.image_url}
                alt={product.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 stroke-1 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs text-gray-400 mt-2">Sin imagen cargada</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h3>
            <p className="mt-2 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {product.description || (
                <span className="italic text-gray-400">Este producto no cuenta con descripción detallada.</span>
              )}
            </p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="block text-gray-500 font-medium">Fecha de Creación</span>
              <span className="font-semibold text-gray-800 mt-0.5 block">
                {formatDate(product.created_at)}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="block text-gray-500 font-medium">Última Modificación</span>
              <span className="font-semibold text-gray-800 mt-0.5 block">
                {formatDate(product.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Producto
          </button>
        </div>
      </div>
    </div>
  );
}

