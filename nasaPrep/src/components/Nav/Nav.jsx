import React, { useContext, useRef, useState } from 'react'
import './Nav.css'
import { Link } from 'react-router-dom'


const Navbar = () => {

  

 
  return (
    <div className='nav'>
      <img src="/images/new-SpaceApps_logo.webp" alt="" />
      
    <ul  className="nav-menu">
        <li><Link to="/">Home</Link></li>
        <li><Link to="Sports">Sports</Link></li>
        <li><Link to="/DailyMap">Daily Map</Link></li>
         <li><Link to="/Hazards">Hazards</Link></li>
        
    </ul>
      
    </div>
  )
}

export default Navbar