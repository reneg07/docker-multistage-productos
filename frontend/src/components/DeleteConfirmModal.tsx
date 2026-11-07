"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";

interface DeleteConfirmModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
}

export function DeleteConfirmModal({
  product,
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onConfirm(product.id);
      onClose();
    } catch {
      setError("No fue posible eliminar el producto. Inténtalo nuevamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900">
              ¿Eliminar producto?
            </h3>
            <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">
              Estás a punto de eliminar permanentemente el producto{" "}
              <strong className="text-gray-900">"{product.name}"</strong> (ID #{product.id}).
              Esta acción no se puede deshacer y borrará la imagen asociada si existe.
            </p>

            {error && (
              <p className="mt-2 text-xs text-red-600 font-semibold bg-red-50 p-2 rounded">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg shadow-xs transition-colors"
          >
            {isDeleting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Eliminando...</span>
              </>
            ) : (
              <span>Sí, eliminar producto</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

