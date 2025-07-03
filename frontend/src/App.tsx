import './App.css'
import { CodingPage } from './components/CodingPage'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Landing } from './components/Landing';

import LandingLayout from './components/landing/LandingLayout';
import { LandingContent, SignIn, SignUp } from './components/landing/contents';


function App() {
  return (
    <BrowserRouter>

      <Routes>
          <Route element={<LandingLayout />}>
            <Route path="/" element={<LandingContent />} />
            {/* <Route path="/about" element={<About />} /> */}
          </Route>

          <Route path="/signup" element={<SignUp/>} />
          <Route path="/signin" element={<SignIn/>} />

          <Route path="/coding" element={<CodingPage />} />
          {/* <Route path="/" element={<Landing />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
