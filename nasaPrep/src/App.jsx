import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Nav/Nav";
import Footer from "./components/Footer/Footer";

import "./App.css"
import Home from "./components/Home/Home";
import Sports from "./components/Sports/Sports";

function App() {

  return (<>
    <Router>
             

      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/Sports" element={<Sports/>} />
      </Routes>
      
      
      <Footer/>
      
    </Router>
    </>
  );
}

export default App;