export enum UserRole {
  passenger = "passenger",
  admin = "admin",
}

export enum UserStatus {
  active = "active",
  banned = "banned",
  unverified = "unverified",
}

export interface User {
  id: string;
  fullName: string | null;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  _count?: {
    bookings: number;
  };
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
}

export interface UpdateUserRequest {
  id: string;
  data: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  };
}

export interface UpdateRoleRequest {
  id: string;
  role: UserRole;
}

export interface UpdateStatusRequest {
  id: string;
  status: UserStatus;
}

export interface UsersResponse {
  message: string;
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleUserResponse {
  message: string;
  data: User;
}

export interface StatItem {
  value: number;
  growth: number;
}

export interface UserStatsResponse {
  message: string;
  data: {
    total: StatItem;
    newThisMonth: StatItem;
    active: StatItem;
  };
}
