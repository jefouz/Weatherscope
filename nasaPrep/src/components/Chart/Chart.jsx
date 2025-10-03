import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function WeatherChart({ lat, lon, date }) {
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const API_KEY = "bb57d1f689344007928f462271385afc"; // Replace with your key
        const url = `https://api.weatherbit.io/v2.0/history/hourly?lat=${lat}&lon=${lon}&start_date=${date}&end_date=${date}&key=${API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();
        setWeatherData(data.data || []);
      } catch (err) {
        console.error("Error fetching weather:", err);
      }
    }

    fetchWeather();
  }, [lat, lon, date]);

  const chartData = {
    labels: weatherData.map((d) => d.timestamp_local.split("T")[1]), // Hour
    datasets: [
      {
        label: "Temperature (°C)",
        data: weatherData.map((d) => d.temp),
        borderColor: "rgb(255, 99, 132)",
        fill: false,
      },
      {
        label: "Humidity (%)",
        data: weatherData.map((d) => d.rh),
        borderColor: "rgb(54, 162, 235)",
        fill: false,
      },
      {
        label: "Wind Speed (m/s)",
        data: weatherData.map((d) => d.wind_spd),
        borderColor: "rgb(75, 192, 192)",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Weather Data (Hourly)" },
    },
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      {weatherData.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p>Loading weather data...</p>
      )}
    </div>
  );
}
