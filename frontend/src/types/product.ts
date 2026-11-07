export interface Product {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: Record<string, string[]>;
}

export interface ProductFormData {
  name: string;
  category: string;
  description: string;
  image?: File | null;
}

