// src/components/weatherAPI.js
import { format, addDays } from "date-fns";

// Geocode city/country to lat/lon
export async function geocodeCity(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`
    );
    const data = await res.json();
    if (!data.length) return null;

    const place = data[0];
    const address = place.address;

    const cityName = address.city || address.town || address.village || address.state || address.country;
    const countryName = address.country || "";

    return {
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
      name: cityName + (countryName && cityName !== countryName ? `, ${countryName}` : "")
    };
  } catch (err) {
    console.error("Geocoding error:", err);
    return null;
  }
}

// Fetch single-day weather
export async function fetchWeatherbitData(lat, lon, apiKey, date, locationName = "") {
  try {
    const today = new Date();
    const targetDate = format(date, "yyyy-MM-dd");
    let url = "";

    if (date >= today) {
      url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${apiKey}&days=16`;
    } else {
      const start = targetDate;
      const end = format(addDays(date, 1), "yyyy-MM-dd");
      url = `https://api.weatherbit.io/v2.0/history/daily?lat=${lat}&lon=${lon}&start_date=${start}&end_date=${end}&key=${apiKey}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data.data || !data.data.length) return `No weather data available for ${locationName}.`;

    const dayData = data.data.find(d => d.valid_date === targetDate) || data.data[0];

    return `🌍 Weather in ${locationName} on ${format(date, "MMMM do, yyyy")}: 🌡 Max Temp: ${dayData.max_temp}°C 🌡 Min Temp: ${dayData.min_temp}°C 🌧 Precipitation: ${dayData.precip}mm`;
  } catch (err) {
    console.error(err);
    return "Error fetching weather data.";
  }
}

// Fetch next-week forecast as array of messages
export async function fetchWeatherbitNextWeek(lat, lon, apiKey, locationName = "") {
  try {
    const res = await fetch(
      `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${apiKey}&days=16`
    );
    const data = await res.json();
    if (!data || !data.data || !data.data.length) 
      return [`No weather data available for ${locationName}.`];

    const today = new Date();
    const nextWeekData = data.data
      .filter(d => {
        const date = new Date(d.valid_date);
        return date > today && date <= addDays(today, 7);
      });

    return nextWeekData.map(d => 
      `🌍 ${d.valid_date}: 🌡 Max: ${d.max_temp}°C, Min: ${d.min_temp}°C, 🌧 Precip: ${d.precip}mm`
    );
  } catch (err) {
    console.error(err);
    return ["Error fetching next week weather."];
  }
}
