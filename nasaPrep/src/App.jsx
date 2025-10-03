import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Nav/Nav";
import Footer from "./components/Footer/Footer";

import "./App.css"
import Home from "./components/Home/Home";

function App() {

  return (<>
    <Router>
             

      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>} />
      </Routes>
      
      
      <Footer/>
      
    </Router>
    </>
  );
}

export default App;