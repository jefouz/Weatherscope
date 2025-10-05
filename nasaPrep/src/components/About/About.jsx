import React from "react";
import "./About.css";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-text">
          <h1>About Weatherscope</h1>
          <p>
            Weatherscope is a cutting-edge weather application designed to provide
            accurate, real-time weather insights across the globe. Our mission is to
            empower users to make informed decisions about outdoor activities, travel,
            and sports by giving them detailed weather data for any location, date, and time.
          </p>
        </div>
        <div className="about-hero-image">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Global_tropical_cyclone_tracks-edit2.jpg/640px-Global_tropical_cyclone_tracks-edit2.jpg"
            alt="Global Weather Map"
          />
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-mission">
        <div className="mission-card">
          <h2>Our Mission</h2>
          <p>
            To provide accessible, accurate, and actionable weather information that helps
            people plan their day, engage in sports safely, and stay informed about environmental conditions.
          </p>
        </div>
        <div className="vision-card">
          <h2>Our Vision</h2>
          <p>
            To become the go-to platform for weather-based decision-making, blending real-time data,
            user-friendly interface, and innovative predictive features to enhance daily life.
          </p>
        </div>
      </section>

      {/* Team Section */}
    <section className="about-team">
      <h2>Meet the Team</h2>
      <div className="team-cards">
        <div className="team-card">
          <img
            src="/images/Ali Adnan Jaffal.jpg"
            alt="Ali Adnan Jaffal"
          />
          <h3>Ali Adnan Jaffal</h3>
          <p>lead UI Designer</p>
        </div>
        <div className="team-card">
          <img
            src="/images/Hussein Al Sheebe.jpg"
            alt="Hussein Al Sheebe"
          />
          <h3>Hussein Al Shaobi</h3>
          <p>DEV</p>
        </div>
        <div className="team-card">
          <img
            src="/images/Ali Mohammad Jaffal.jpg"
            alt="Ali Mohammad Jaffal"
          />
          <h3>Ali Mohammad Jaffal</h3>
          <p>DEV</p>
        </div>
      </div>
    </section>


      {/* Features Section */}
      <section className="about-features">
        <h2>Key Features</h2>
        <div className="features-cards">
          <div className="feature-card">
            <h3>Interactive Global Map</h3>
            <p>Click any location to explore detailed weather data for your chosen date and time.</p>
          </div>
          <div className="feature-card">
            <h3>Sports Activity Guidance</h3>
            <p>Get recommendations on whether the weather is suitable for your favorite sports.</p>
          </div>
          <div className="feature-card">
            <h3>Accurate Weather Data</h3>
            <p>Leverages reliable APIs to provide current and historical weather information.</p>
          </div>
          <div className="feature-card">
            <h3>User-Friendly Experience</h3>
            <p>Intuitive interface for effortless navigation and easy access to essential data.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta">
        <h2>Get Started with Weatherscope</h2>
        <p>
          Explore the world of weather data and plan your activities with confidence.
        </p>
        <Link to="/DailyMap" className="btn">
                      🌍 View Map
        </Link>
      </section>
    </div>
  );
};

export default About;
