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
            <Link to="/DailyMap" className="butn">
              🌍 View Map
            </Link>
            <Link to="/Sports" className="butn">
              ⚽ Sports Check
            </Link>
             <Link to="/Hazards" className="butn ">
              🌪️ Check Natural Hazards
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://media.istockphoto.com/id/2204520095/photo/the-beauty-of-earth-from-space-with-stunning-visuals-of-our-planets-landscapes-and-features.webp?a=1&b=1&s=612x612&w=0&k=20&c=n7dilFnqIeftvxQ936HLEQeNpV9SXDpuDXIw4-DyYpA="
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
              src="/images/new-SpaceApps_logo.webp"
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
