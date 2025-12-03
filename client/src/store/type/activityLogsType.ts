import { UserRole } from "./usersType";

export interface ActivityLogUser {
  fullName: string | null;
  email: string;
  role: UserRole;
}

export type LogMetadata = Record<string, unknown>;

export interface ActivityLog {
  id: string;
  userId: string | null;
  action: string;
  entityId: string | null;
  entityType: string | null;
  metadata: LogMetadata | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: ActivityLogUser | null;
}

export interface ActivityLogQueryParams {
  page?: number;
  limit?: number;
}

export interface ActivityLogsResponse {
  message: string;
  data: {
    logs: ActivityLog[];
    meta: {
      total: number;
      page: number;
      limit: number;
      lastPage: number;
    };
  };
}

export interface ActivityLogHistoryResponse {
  message: string;
  data: ActivityLog[];
}
