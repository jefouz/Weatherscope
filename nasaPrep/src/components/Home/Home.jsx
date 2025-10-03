import React from 'react'
import MapComponent from "../../components/Map/Map";
import HourlyChart from "../../components/HourlyChart/HourlyChart";
import SpiderWeatherFetcher from '../../components/SpiderWeatherFetcher/SpiderWeatherFetcher';

const Home = () => {
  return (
    <div>
        <div className="wrapper">
            <MapComponent />
            <SpiderWeatherFetcher />
            <HourlyChart />
        </div>
        
    </div>
  )
}

export default Home