"use client";

import React from "react";

export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs animate-pulse flex flex-col justify-between"
        >
          {/* Image Skeleton */}
          <div className="aspect-4/3 w-full bg-gray-200" />

          {/* Body Skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between">
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          </div>

          {/* Action buttons skeleton */}
          <div className="px-4 pb-4 pt-1 grid grid-cols-3 gap-2 border-t border-gray-50 bg-gray-50/50">
            <div className="h-7 bg-gray-200 rounded-lg" />
            <div className="h-7 bg-gray-200 rounded-lg" />
            <div className="h-7 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

