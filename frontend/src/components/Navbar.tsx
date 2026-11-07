"use client";

import React from "react";

interface NavbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  onOpenCreate: () => void;
  isHealthy: boolean | null;
}

export function Navbar({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onOpenCreate,
  isHealthy,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  Gestión de Productos
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Next.js 16 + Laravel 12
                  </span>
                  {isHealthy !== null && (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isHealthy
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                      title={
                        isHealthy
                          ? "Backend conectado y saludable"
                          : "Comprobando conexión con backend..."
                      }
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isHealthy ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                        }`}
                      />
                      {isHealthy ? "API Online" : "API Offline"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Create Button */}
            <button
              onClick={onOpenCreate}
              type="button"
              className="sm:hidden inline-flex items-center p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
              aria-label="Nuevo Producto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Search, Filter & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Limpiar búsqueda"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="py-2 px-3 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Desktop Create Button */}
            <button
              onClick={onOpenCreate}
              type="button"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 shadow-xs hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

