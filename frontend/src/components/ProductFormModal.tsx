"use client";

import React, { useState, useEffect, useRef } from "react";
import { Product } from "@/types/product";
import { ApiError } from "@/lib/api";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  productToEdit?: Product | null;
  categories: string[];
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
  categories,
}: ProductFormModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(productToEdit);

  // Cargar datos al abrir el modal o cambiar el producto a editar
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setDescription(productToEdit.description || "");
      setImagePreview(productToEdit.image_url || null);
    } else {
      setName("");
      setCategory(categories[0] || "Electrónica");
      setDescription("");
      setImagePreview(null);
    }
    setImageFile(null);
    setErrorMessage(null);
    setFieldErrors({});
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo y tamaño (máx 5MB)
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Formato de imagen inválido. Solo se admiten JPG, PNG y WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("La imagen supera el límite máximo de 5MB.");
      return;
    }

    setImageFile(file);
    setErrorMessage(null);

    // Previsualización local
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Validaciones básicas de cliente
    if (!name.trim()) {
      setFieldErrors((prev) => ({ ...prev, name: ["El nombre del producto es obligatorio."] }));
      return;
    }
    if (!category.trim()) {
      setFieldErrors((prev) => ({ ...prev, category: ["La categoría es obligatoria."] }));
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("category", category.trim());
    if (description.trim()) {
      formData.append("description", description.trim());
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
        if (err.errors) {
          setFieldErrors(err.errors);
        }
      } else {
        setErrorMessage("Ocurrió un error inesperado al procesar la solicitud.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEditing ? `Editar Producto #${productToEdit?.id}` : "Registrar Nuevo Producto"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditing
                ? "Modifica los campos del producto y confirma los cambios."
                : "Completa la información requerida para registrar el producto."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="product-name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Nombre del Producto <span className="text-red-500">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Teclado Mecánico RGB"
              className={`w-full px-3.5 py-2 text-sm bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.name
                  ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {fieldErrors.name.join(", ")}
              </p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="product-category" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="product-category"
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Selecciona o escribe una categoría"
                className={`w-full px-3.5 py-2 text-sm bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  fieldErrors.category
                    ? "border-red-400 focus:ring-red-400 focus:border-red-400"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              <datalist id="category-suggestions">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            {fieldErrors.category && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {fieldErrors.category.join(", ")}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="product-desc" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Descripción <span className="text-gray-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              id="product-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción breve de características, especificaciones..."
              className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Subida de Imagen */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Imagen del Producto <span className="text-gray-400 font-normal">(JPG, PNG, WEBP — Máx 5MB)</span>
            </label>

            {imagePreview ? (
              <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 p-2 flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-300">
                  <img
                    src={imagePreview}
                    alt="Previsualización"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {imageFile ? imageFile.name : "Imagen actual del producto"}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {imageFile
                      ? `${(imageFile.size / 1024).toFixed(1)} KB`
                      : "Almacenada en backend"}
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Quitar imagen
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-4 text-center bg-gray-50 hover:bg-blue-50/30 transition-all"
              >
                <svg
                  className="mx-auto w-8 h-8 text-gray-400"
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
                <p className="mt-1.5 text-xs font-medium text-gray-700">
                  Haz clic para seleccionar una imagen
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">PNG, JPG o WEBP hasta 5MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            {fieldErrors.image && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {fieldErrors.image.join(", ")}
              </p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg shadow-xs transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>{isEditing ? "Actualizando..." : "Guardando..."}</span>
                </>
              ) : (
                <span>{isEditing ? "Guardar Cambios" : "Crear Producto"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

