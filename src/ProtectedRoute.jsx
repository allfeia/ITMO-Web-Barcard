import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext/useAuth.js';

export default function ProtectedRoute({ children, allow = [] }) {
  const { role, roles } = useAuth();

  if (allow.length) {
    const userRoles = new Set([role, ...(roles || [])].filter(Boolean));
    const ok = allow.some(r => userRoles.has(r));
    if (!ok) return <Navigate to="/" replace />;
  }
  return children;
}