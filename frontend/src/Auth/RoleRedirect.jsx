import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RoleRedirect = () => {
  const { isAuthenticated, role } = useAuth(); // Ambil status autentikasi dan peran
  //  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  switch (role) {
    case 'Admin':
      return <Navigate to="/skk" />;
    case 'KKKS':
      return <Navigate to="/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};

export default RoleRedirect;
