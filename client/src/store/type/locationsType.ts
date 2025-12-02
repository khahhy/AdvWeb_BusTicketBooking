export interface Location {
  id: string;
  name: string;
  address?: string | null;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationRequest {
  name: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateLocationRequest extends Partial<CreateLocationRequest> {
  id: string;
}

export interface QueryLocationParams {
  city?: string;
  search?: string;
}
