import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

interface Props {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
