import { useEffect, useState } from "react";
import { useLocation } from "../../context/LocationContext";
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

export default function WeatherChart({ date }) {
  const { coordinates } = useLocation();
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    if (!coordinates?.lat || !coordinates?.lng || !date) return;

    async function fetchWeather() {
      try {
        const API_KEY = "bb57d1f689344007928f462271385afc";

        // Weatherbit daily forecast endpoint for 7 days
        const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates.lat}&lon=${coordinates.lng}&days=7&key=${API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        // Filter for the selected date + next 6 days
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 6);

        const filteredData = data.data.filter((d) => {
          const dDate = new Date(d.valid_date);
          return dDate >= startDate && dDate <= endDate;
        });

        setWeatherData(filteredData);
      } catch (err) {
        console.error("Error fetching weather:", err);
      }
    }

    fetchWeather();
  }, [coordinates, date]);

  const chartData = {
    labels: weatherData.map((d) => d.valid_date), // 7 days
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
      title: { display: true, text: `7-Day Weather Forecast from ${date}` },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.dataset.label === "Temperature (°C)")
              return `${context.parsed.y} °C`;
            if (context.dataset.label === "Humidity (%)")
              return `${context.parsed.y} %`;
            if (context.dataset.label === "Wind Speed (m/s)")
              return `${context.parsed.y} m/s`;
          },
        },
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      {weatherData.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p>Loading 7-day weather data...</p>
      )}
    </div>
  );
}