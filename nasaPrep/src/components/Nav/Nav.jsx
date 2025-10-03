import React, { useContext, useRef, useState } from 'react'
import './Nav.css'
import { Link } from 'react-router-dom'


const Navbar = () => {

  

 
  return (
    <div className='nav'>
      
    <ul  className="nav-menu">
        <li><Link to="/">Home</Link></li>

        <li><Link to="Sports">Sports</Link></li>
        <li>loc 3</li>
        <li>loc 3</li>
    </ul>
      
    </div>
  )
}

export default Navbar