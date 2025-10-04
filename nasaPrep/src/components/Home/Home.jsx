import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Welcome to Weatherscope</h1>
          <p>
            This is our project for the NASA Space Apps Challenge.  
            Weatherscope lets you explore global weather by clicking anywhere on
            a daily map. Choose a time and location, and instantly see details
            like temperature, humidity, and more.  
            Wondering if it’s a good day for your favorite sport? We’ve got you
            covered.
          </p>
          <div className="hero-buttons">
            <Link to="/map" className="btn">
              🌍 View Map
            </Link>
            <Link to="/sports-check" className="btn secondary">
              ⚽ Sports Check
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://www.publicdomainpictures.net/pictures/30000/nahled/weather-map-1385395321t.jpg"
            alt="Earth weather"
          />
        </div>
      </section>

      {/* Highlights */}
      <section className="highlights">
        <h2>What You Can Do</h2>
        <div className="cards">
          <div className="card">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1146/1146869.png"
              alt="Weather map"
            />
            <h3>Explore Global Weather</h3>
            <p>
              Get data on max/min temperature, humidity, and more for any place
              at any time.
            </p>
          </div>

          <div className="card">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1048/1048953.png"
              alt="Sports"
            />
            <h3>Plan Your Sports</h3>
            <p>
              Select a sport, and we’ll analyze if the weather is suitable for
              your activity.
            </p>
          </div>

          <div className="card">
            <img
              src="https://cdn-icons-png.flaticon.com/512/616/616408.png"
              alt="NASA"
            />
            <h3>Built for Space Apps</h3>
            <p>
              Created for the NASA Space Apps Challenge, bringing innovation and
              exploration together.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
