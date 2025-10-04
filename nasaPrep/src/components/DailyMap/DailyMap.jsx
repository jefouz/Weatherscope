import React from 'react'
import MapComponent from "../../components/Map/Map";
import HourlyChart from "../../components/HourlyChart/HourlyChart";
import SpiderWeatherFetcher from '../../components/SpiderWeatherFetcher/SpiderWeatherFetcher';
import "./DailyMap.css";
const DailyMap = () => {
  return (
    <div className="wrapper">
          <div className="HorizantalWrapper">
            <MapComponent />
            <SpiderWeatherFetcher />
          </div>
            <HourlyChart />
        </div>
        
  )
}

export default DailyMap