import React from 'react';
import { useAuthStore } from '../store/authStore';
import { LoginPage } from '../pages/LoginPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  if (requiredPermission && user.role !== 'ADMIN') {
    const hasPermission = user.permissions?.includes(requiredPermission);
    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
          <div className="glass-panel p-8 rounded-2xl max-w-md text-center border border-red-500/30">
            <h2 className="text-xl font-bold text-red-400 mb-2">Không có quyền truy cập</h2>
            <p className="text-sm text-slate-400 mb-4">
              Tài khoản của bạn ({user.role}) không được cấp quyền thực hiện chức năng này (`{requiredPermission}`).
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
