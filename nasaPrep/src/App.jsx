import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Nav/Nav";
import Footer from "./components/Footer/Footer";

import "./App.css"
import Home from "./components/Home/Home";
import Sports from "./components/Sports/Sports";
import DailyMap from "./components/DailyMap/DailyMap";
import About from "./components/About/About";
import HazardsMap from "./components/HazardsMap/HazardsMap";
function App() {

  return (<>
    <Router>
             

      <Navbar />
      <Routes>
        <Route path="/Hazards" element={<HazardsMap/>}></Route>
        <Route path="/About" element={<About/>}></Route>
        <Route path="/" element={<Home/>} />
        <Route path="/Sports" element={<Sports/>} />
        <Route path="/DailyMap" element={<DailyMap/>} />
      </Routes>
      
      
      <Footer/>
      
    </Router>
    </>
  );
}

export default App;