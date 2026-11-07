<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('search')) {
            $term = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                  ->orWhere('description', 'like', $term);
            });
        }

        $products = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'count' => $products->count(),
            'data' => $products,
        ], 200);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $imagePath = null;
        if ($request->hasFile('image')) {
            // Guarda el archivo con un hash único en storage/app/public/products
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'image' => $imagePath,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Producto registrado exitosamente.',
            'data' => $product,
        ], 201);
    }

    /**
     * Display the specified product.
     */
    public function show(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
        ], 200);
    }

    /**
     * Update the specified product in storage.
     */
    public function update(UpdateProductRequest $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado.',
            ], 404);
        }

        $validated = $request->validated();

        // Si se sube una nueva imagen, eliminar la anterior para evitar imágenes huérfanas
        if ($request->hasFile('image')) {
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }

            $product->image = $request->file('image')->store('products', 'public');
        }

        if (array_key_exists('name', $validated)) {
            $product->name = $validated['name'];
        }
        if (array_key_exists('category', $validated)) {
            $product->category = $validated['category'];
        }
        if (array_key_exists('description', $validated)) {
            $product->description = $validated['description'];
        }

        $product->save();

        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado exitosamente.',
            'data' => $product,
        ], 200);
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado.',
            ], 404);
        }

        // Eliminar imagen asociada para evitar archivos huérfanos
        if ($product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado exitosamente.',
        ], 200);
    }
}
