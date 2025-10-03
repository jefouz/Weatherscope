import { useEffect, useState } from "react";
import { useLocation } from "../../context/LocationContext"; // import your context
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
  const { coordinates } = useLocation(); // get coordinates from context
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    if (!coordinates?.lat || !coordinates?.lng || !date) return;

    async function fetchWeather() {
      try {
        const API_KEY = "bb57d1f689344007928f462271385afc";

        // Add 1 day to end date for Weatherbit historical API
        const startDate = date;
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        const endDateStr = endDate.toISOString().split("T")[0];

        const url = `https://api.weatherbit.io/v2.0/history/hourly?lat=${coordinates.lat}&lon=${coordinates.lng}&start_date=${startDate}&end_date=${endDateStr}&key=${API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        // Filter only the hours of the original date
        const filteredData = data.data.filter(
          (d) => d.timestamp_local.split("T")[0] === startDate
        );

        setWeatherData(filteredData);
      } catch (err) {
        console.error("Error fetching weather:", err);
      }
    }

    fetchWeather();
  }, [coordinates, date]);

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
      title: { display: true, text: `Weather Data (Hourly) for ${date}` },
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
