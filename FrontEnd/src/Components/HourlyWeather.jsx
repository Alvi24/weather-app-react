import React, { useMemo, useState } from "react";
import styles from "../styles/HourlyWeather.module.css";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function HourlyWeather({ hourlyWeather }) {
  const [chartEnabled, setChartEnabled] = useState(false);

  console.log(hourlyWeather);
  const chartDataMemo = useMemo(() => {
    return {
      labels: hourlyWeather.time,
      datasets: [
        {
          data: hourlyWeather.temp,
          label: `Hourly Weather ` + hourlyWeather.day,
          fill: false,
          borderColor: "white",
          lineTension: 0.1,
        },
      ],
    };
  }, [hourlyWeather]);
  const chartOptions = {
    title: {
      display: true,
    },
    legend: {
      display: false,

      labels: {
        boxWidth: 0,
      },
    },
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Hours",
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Temperature",
        },
      },
    },
    maintainAspectRatio: false, // set to false to make the chart responsive
    responsive: true, // set to true to make the chart responsive
    // animation: false, // set animation to false to achieve a smoother animation
    
  };
  return (
    <div className={styles["HourlyContainer"]}>
      <Line
        className={styles["chart"]}
        data={chartDataMemo}
        options={chartOptions}
      />
    </div>
  );
}
