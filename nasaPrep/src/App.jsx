import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Nav/Nav";
import Footer from "./components/Footer/Footer";
import Chatbot from "./components/Chatbot/Chatbot";
import "./App.css"
import Home from "./components/Home/Home";
import Sports from "./components/Sports/Sports";
import DailyMap from "./components/DailyMap/DailyMap";
import About from "./components/About/About";
import HazardsMap from "./components/HazardsMap/HazardsMap";
import Contact from "./components/Contact/Contact";

function App() {

  return (<div className="app">
    <Router >
             

   <Navbar />
      <Routes>
        <Route path="/Hazards" element={<HazardsMap/>}></Route>
        <Route path="/About" element={<About/>}></Route>
        <Route path="/Contact" element={<Contact/>}></Route>
        <Route path="/" element={<Home/>} />
        <Route path="/Sports" element={<Sports/>} />
        <Route path="/DailyMap" element={<DailyMap/>} />
      </Routes>
      
      
      <Chatbot />
    
      <Footer/>

     
      
    </Router>
    </div>
  );
}

export default App;