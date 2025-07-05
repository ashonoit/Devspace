import './App.css'
import { Navigate } from 'react-router-dom';
import { CodingPage } from './components/CodingPage'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing } from './components/Landing';

import LandingLayout from './components/launch/LandingLayout';
import ShuttleLayout from './components/shuttle/ShuttleLayout';
import { LandingContent, SignIn, SignUp } from './components/launch/contents';
import { Dashboard, Profile } from './components/shuttle/contents';


function App() {
  const isAuth =true;
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

          <Route element={<ShuttleLayout />}>
            <Route path="/dashboard" element={isAuth ? <Dashboard /> : <Navigate to={"/signin"}/>} />
            <Route path="/profile" element={isAuth ? <Profile /> : <Navigate to={"/profile"}/>} />

          </Route>

          <Route path="/coding" element={<CodingPage />} />
          {/* <Route path="/" element={<Landing />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
