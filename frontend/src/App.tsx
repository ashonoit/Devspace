import './App.css'
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CodingPage } from './components/CodingPage'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing } from './components/Landing';

import LandingLayout from './components/launch/LandingLayout';
import ShuttleLayout from './components/shuttle/ShuttleLayout';
import PrivateRoute from './components/PrivateRoute';
import { LandingContent, SignIn, SignUp } from './components/launch/contents';
import { Console,Profile } from './components/shuttle/contents';

import { useAppSelector, useAppDispatch} from './redux/reduxTypeSafety';
import { loadUser } from './redux/slices/authSlice';



function App() {

  const theme = useAppSelector((state)=>state.theme.mode);  //store mustve theme stored in local storage
  const dispatch =useAppDispatch();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);   //to actually manipulate DOM

  // useEffect(()=>{
  //   dispatch(loadUser());
  // },[])

//   const authLoading = useAppSelector(state => state.auth.loading);
//   const isAuthenticated = useAppSelector(state => state.auth.authenticated);

//     useEffect(() => {
//   console.log("authLoading:", authLoading, "isAuthenticated:", isAuthenticated);
// }, [authLoading, isAuthenticated]);
  
  // if(authLoading){
  //   return <h1>Loading...</h1>;
  // }

  // console.log(isAuthenticated)




  return (
    <BrowserRouter>

      <Routes>
          <Route element={<LandingLayout />}>
            <Route path="/" element={<LandingContent />} />
            {/* <Route path="/about" element={<About />} /> */}
          </Route>

          <Route path="/signup" element={<SignUp/>} />
          <Route path="/signin" element={<SignIn/>} />

          {/* Private routes:- */}

          <Route element={<PrivateRoute />}>
            <Route element={<ShuttleLayout />} >
            
              <Route path="/console" element={<Console />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/namespace/:spaceId" element={<CodingPage />} />
          </Route>

          <Route path="/coding" element={<CodingPage />} />
          {/* <Route path="/" element={<Landing />} /> */}
      </Routes>
    </BrowserRouter>
  )
}



export default App
