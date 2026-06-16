import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const AdminProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="animate-spin w-10 h-10 text-green-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
