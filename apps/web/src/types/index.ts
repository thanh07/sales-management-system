export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'WAREHOUSE' | 'SALE';

export interface User {
  userId: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  branchId?: string;
  permissions: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
