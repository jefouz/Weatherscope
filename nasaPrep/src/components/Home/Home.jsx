import React from 'react'
import MapComponent from "../../components/Map/Map";
import WeatherFetcher from "../../components/WeatherFetcher/WeatherFetcher";
import HourlyChart from "../../components/HourlyChart/HourlyChart";

const Home = () => {
  return (
    <div>
        <div className="wrapper">
            <MapComponent />
            <WeatherFetcher />
            <HourlyChart />
        </div>
        
    </div>
  )
}

export default Home