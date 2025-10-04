import React from 'react'
import MapComponent from "../../components/Map/Map";
import HourlyChart from "../../components/HourlyChart/HourlyChart";
import SpiderWeatherFetcher from '../../components/SpiderWeatherFetcher/SpiderWeatherFetcher';
import "./DailyMap.css";
const DailyMap = () => {
  return (
    <div className="map-wrapper">
          <div className="HorizantalWrapper">
              <div className="map-section">
                  <MapComponent />
              </div>
          <SpiderWeatherFetcher /> 
          </div>
          <HourlyChart />  
    </div>
    
        
  )
}

export default DailyMap