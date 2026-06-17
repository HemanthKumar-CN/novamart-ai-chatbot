import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-gray-500">Loading NovaMart...</p>
        </div>
      </div>
    );
  }

  if (!token) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
