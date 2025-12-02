// Normalize response from BE
export interface ApiResponse<T> {
  message: string;
  data: T;
  // Meta for pagination
  meta?: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

// Common request interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
}
