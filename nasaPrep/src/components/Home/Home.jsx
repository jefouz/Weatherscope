import React from 'react'
import "./Home.css";
import MapComponent from "../../components/Map/Map";
import HourlyChart from "../../components/HourlyChart/HourlyChart";
import SpiderWeatherFetcher from '../../components/SpiderWeatherFetcher/SpiderWeatherFetcher';

const Home = () => {
  return (
    <div>
        <div className="wrapper">
          <div className="HorizantalWrapper">
            <MapComponent />
            <SpiderWeatherFetcher />
          </div>
            <HourlyChart />
        </div>
        
    </div>
  )
}

export default Home