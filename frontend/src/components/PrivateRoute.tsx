import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/reduxTypeSafety';

const PrivateRoute = () => {
  const isAuthenticated = useAppSelector(state => state.auth.authenticated);
  const authLoading = useAppSelector(state => state.auth.loading);

  if (authLoading) return (
    <div className='w-screen h-screen flex flex-row items-center justify-center'>
        <h1 className='text-5xl'>Nikal jaaaa...</h1>
    </div>
  );

  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoute;