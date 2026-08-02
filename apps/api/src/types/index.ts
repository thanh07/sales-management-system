import { Request } from 'express';

export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAREHOUSE' | 'SALE';

export interface UserPayload {
  userId: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  branchId?: string;
  permissions: string[]; // e.g. ["PRODUCTS:READ", "POS:CREATE"]
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}
