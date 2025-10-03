import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Nav/Nav";
import Footer from "./components/Footer/Footer";
import MapComponent from "./components/map/Map";
import WeatherFetcher from "./components/WeatherFetcher/WeatherFetcher";
import "./App.css"

function App() {

  return (<>
    <Router>
      <Navbar />
      <Routes>
        
      </Routes>
      
      <div className="wrapper"><MapComponent />
      <WeatherFetcher  date="2025-07-01" />
      </div>
      <Footer/>
      
    </Router>
    </>
  );
}

export default App;