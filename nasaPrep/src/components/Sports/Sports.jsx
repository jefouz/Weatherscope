import React, { useState, useEffect } from "react";
import MapComponent from "../../components/Map/Map";
import sports, { checkSportSuitability } from "../../data/sports";
import { useLocation } from "../../context/LocationContext";
import "./Sports.css";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const Sports = () => {
  const { coordinates, date: contextDate, setDate } = useLocation();

  // --- Date setup ---
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 16);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  const safeDate = contextDate
    ? contextDate < todayStr
      ? todayStr
      : contextDate > maxDateStr
      ? maxDateStr
      : contextDate
    : todayStr;

  // --- State ---
  const [selectedSport, setSelectedSport] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [suitability, setSuitability] = useState(null);
  const [bestDays, setBestDays] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);

  const selectedDate = safeDate;

  // --- Fetch Weather ---
  useEffect(() => {
    if (!coordinates || !selectedDate) return;

    const fetchWeather = async () => {
      try {
        const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates.lat}&lon=${coordinates.lng}&key=${API_KEY}&days=16`;
        const res = await fetch(url);
        const data = await res.json();

        if (data?.data) {
          setForecast(data.data);

          const normalizedDate = new Date(selectedDate).toISOString().split("T")[0];
          const day = data.data.find((d) => d.valid_date === normalizedDate);

          if (day) {
            setWeather({
              temp: day.temp ?? 0,
              wind_speed: day.wind_spd ?? 0,
              humidity: day.rh ?? 0,
              precip: day.precip ?? 0,
              uv: day.uv ?? 0,
              clouds: day.clouds ?? 0,
              snow: day.snow ?? 0,
              solar_radiation: day.solar_rad ?? 0,
            });
          } else {
            setWeather(null);
          }
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
        setWeather(null);
      }
    };

    fetchWeather();
  }, [coordinates, selectedDate]);

  // --- Update Suitability ---
  useEffect(() => {
    if (selectedSport && weather) {
      setSuitability(checkSportSuitability(selectedSport, weather));
    } else {
      setSuitability(null);
    }
  }, [selectedSport, weather]);

  // --- Reset Best Days when coordinates or sport changes ---
  useEffect(() => {
    setBestDays([]);
    setHasChecked(false);
  }, [coordinates, selectedSport]);

  // --- Find Best Days ---
  const handleFindBestDays = () => {
    setHasChecked(true);

    if (!forecast.length || !selectedSport) {
      alert("Please select a sport and location first!");
      return;
    }

    const suitableDays = forecast
      .map((day) => ({
        date: day.valid_date,
        suitability: checkSportSuitability(selectedSport, {
          temp: day.temp ?? 0,
          wind_speed: day.wind_spd ?? 0,
          humidity: day.rh ?? 0,
          precip: day.precip ?? 0,
          uv: day.uv ?? 0,
          clouds: day.clouds ?? 0,
          snow: day.snow ?? 0,
          solar_radiation: day.solar_rad ?? 0,
        }),
      }))
      .filter((d) => d.suitability.suitable)
      .slice(0, 7);

    setBestDays(suitableDays);
  };

  return (
    <div className="sports-page">
      <div className="flexwrapper">
      {/* Map */}
      <div className="map-section">
        <MapComponent />
      </div>

      {/* Controls + Weather + Suitability */}
      <div className="sports-wrapper">
        <div className="controls-section">
          {/* Sport Selector */}
          <div className="selector-group">
            <h2>Select Sport</h2>
            <select
              value={selectedSport?.name || ""}
              onChange={(e) =>
                setSelectedSport(sports.find((s) => s.name === e.target.value))
              }
            >
              <option value="">-- Choose a sport --</option>
              {sports.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="date-group">
            <h2>Select Date</h2>
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              max={maxDateStr}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Weather Info */}
        {weather ? (
          <div className="weather-display">
            <h3>Weather Forecast for {selectedDate}</h3>
            <div className="weather-cards">
              <div>🌡️ Temp: {weather.temp}°C</div>
              <div>💨 Wind: {weather.wind_speed} m/s</div>
              <div>💧 Humidity: {weather.humidity}%</div>
              <div>🌧️ Precipitation: {weather.precip} mm</div>
              <div>☀️ UV Index: {weather.uv}</div>
              <div>☁️ Cloud Cover: {weather.clouds}%</div>
              <div>❄️ Snow: {weather.snow} mm</div>
              <div>🔆 Solar Radiation: {weather.solar_radiation} W/m²</div>
            </div>
          </div>
        ) : (
          <p>No forecast available for this date.</p>
        )}

        {/* Suitability */}
        {suitability && (
          <div className={`suitability ${suitability.suitable ? "good" : "bad"}`}>
            <h3>
              {suitability.suitable
                ? suitability.message
                : "Unsuitable Weather Conditions:"}
            </h3>
            {!suitability.suitable && (
              <ul>
                <li>{suitability.message}</li>
              </ul>
            )}
          </div>
        )}
      </div>
  </div>
      {/* --- Best Days Section (Below Everything) --- */}
      <div className="best-days-section">
        <button className="best-days-btn" onClick={handleFindBestDays}>
          🔎 Find the Next Good Days for Your Sport
        </button>
        <p className="best-days-desc">
          Click to see which upcoming days in the next two weeks are best for your chosen sport based on the weather forecast.
        </p>

        {hasChecked && (
          bestDays.length > 0 ? (
            <div className="best-days-list">
              <h3>✅ Upcoming Good Days for {selectedSport.name}</h3>
              <ul>
                {bestDays.map((d) => (
                  <li key={d.date}>
                    <strong>{d.date}</strong> — {d.suitability.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="no-best-days">
              {selectedSport && coordinates
                ? "No suitable days found for this sport in the next two weeks."
                : "No suitable days found yet. Please select a sport and location."}
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default Sports;
