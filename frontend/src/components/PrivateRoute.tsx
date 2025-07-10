import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux/reduxTypeSafety';
import { loadUser } from '../redux/slices/authSlice';

const PrivateRoute = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const isAuthenticated = useAppSelector(state => state.auth.authenticated);
  const authLoading = useAppSelector(state => state.auth.loading);

  useEffect(() => {
    dispatch(loadUser());
  }, [location.pathname]);

  if (authLoading) {
    return (
      <div className="w-screen h-screen bg-black flex flex-row items-center justify-center">
        <h1 className="text-5xl text-zinc-200">Nikal jaaaa...</h1>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoute;
