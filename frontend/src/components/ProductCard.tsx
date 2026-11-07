"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  // Formateo de fecha
  const formattedDate = new Date(product.created_at).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col justify-between">
      {/* Product Image / Placeholder */}
      <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden border-b border-gray-100 flex items-center justify-center">
        {product.image_url && !imageError ? (
          // Usamos standard img para máxima compatibilidad con proxy relativo sin configuración de dominios remotos
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
            <svg
              className="w-12 h-12 stroke-1 text-gray-300 shrink-0"
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs text-gray-400 mt-1">Sin imagen</span>
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-white/90 backdrop-blur-xs text-gray-800 shadow-xs border border-gray-200">
          {product.category}
        </span>

        {/* ID Badge */}
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[11px] font-mono text-gray-600 bg-gray-900/10 backdrop-blur-xs rounded">
          #{product.id}
        </span>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>
          <p
            className="mt-1.5 text-sm text-gray-600 line-clamp-2 leading-relaxed"
            title={product.description || "Sin descripción"}
          >
            {product.description || (
              <span className="italic text-gray-400">Sin descripción adicional</span>
            )}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 pt-1 grid grid-cols-3 gap-2 border-t border-gray-50 bg-gray-50/50">
        <button
          onClick={() => onView(product)}
          type="button"
          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          title="Ver detalle"
        >
          <svg className="w-3.5 h-3.5 shrink-0" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Ver</span>
        </button>

        <button
          onClick={() => onEdit(product)}
          type="button"
          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          title="Editar producto"
        >
          <svg className="w-3.5 h-3.5 shrink-0" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Editar</span>
        </button>

        <button
          onClick={() => onDelete(product)}
          type="button"
          className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          title="Eliminar producto"
        >
          <svg className="w-3.5 h-3.5 shrink-0" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Borrar</span>
        </button>
      </div>
    </article>
  );
}

