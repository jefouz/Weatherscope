import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="footer">
      
      <ul className="footer-links">
        <li><Link to="/About">About</Link></li>
        <li><Link to="/Contact">Contact</Link></li>
      </ul>
      
      <div className="footer-copyright">
        <hr />
        <p>Copyright @ 2025 - ALL RIGHTS RESERVED</p>
      </div>
    </div>
  );
}

export default Footer;