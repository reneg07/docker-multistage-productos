import { ApiResponse, Product } from "@/types/product";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = body?.message || `Error del servidor (${res.status})`;
    const errors = body?.errors;
    throw new ApiError(message, res.status, errors);
  }

  return body as T;
}

export async function getHealthStatus(): Promise<{ status: string; timestamp: string }> {
  try {
    const res = await fetch(`${BASE_API_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });
    return await handleResponse<{ status: string; timestamp: string }>(res);
  } catch (error) {
    throw error;
  }
}

export async function getProducts(params?: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params?.category && params.category !== "all") {
    searchParams.set("category", params.category);
  }
  if (params?.search && params.search.trim()) {
    searchParams.set("search", params.search.trim());
  }

  const query = searchParams.toString();
  const url = `${BASE_API_URL}/products${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const json = await handleResponse<ApiResponse<Product[]>>(res);
  return json.data || [];
}

export async function getProduct(id: number): Promise<Product> {
  const res = await fetch(`${BASE_API_URL}/products/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const json = await handleResponse<ApiResponse<Product>>(res);
  if (!json.data) {
    throw new ApiError("Producto no encontrado", 404);
  }
  return json.data;
}

export async function createProduct(formData: FormData): Promise<Product> {
  const res = await fetch(`${BASE_API_URL}/products`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  const json = await handleResponse<ApiResponse<Product>>(res);
  if (!json.data) {
    throw new ApiError("Respuesta inesperada al crear producto", 500);
  }
  return json.data;
}

export async function updateProduct(
  id: number,
  formData: FormData
): Promise<Product> {
  // Laravel procesa archivos multipart mediante POST con _method=PUT
  if (!formData.has("_method")) {
    formData.append("_method", "PUT");
  }

  const res = await fetch(`${BASE_API_URL}/products/${id}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  const json = await handleResponse<ApiResponse<Product>>(res);
  if (!json.data) {
    throw new ApiError("Respuesta inesperada al actualizar producto", 500);
  }
  return json.data;
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${BASE_API_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  await handleResponse<ApiResponse<null>>(res);
}

