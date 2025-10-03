import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Nav/Nav";
import Footer from "./components/Footer/Footer";
import MapComponent from "./components/Map/Map";
import WeatherFetcher from "./components/WeatherFetcher/WeatherFetcher";
import "./App.css"
import WeatherChart from "./components/Chart/Chart";

function App() {

  return (<>
    <Router>
              <WeatherChart  date={"2023-09-15"} />

      <Navbar />
      <Routes>
        
      </Routes>
      
      <div className="wrapper">
        <MapComponent />
      <WeatherFetcher />
      </div>
      <Footer/>
      
    </Router>
    </>
  );
}

export default App;