import React, { useMemo, useState, useContext, useEffect, useRef } from "react";
import { MyContext } from "./Body";
import { weatherCodeToIcon, externalTooltip } from "../API.mjs";
import styles from "../styles/HourlyWeather.module.css";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function HourlyWeather({
  hourlyWeather,
  visible,
  removeVisible,
}) {
  const [chartEnabled, setChartEnabled] = useState(false);

  const mobileView = useContext(MyContext);
  let prevHourlyWeather = useRef();

  useEffect(() => {
    function effectClick(e) {
      console.log(
        !document
          .querySelector(`.${styles.HourlyContainer}`)
          .contains(e.target),
        prevHourlyWeather.current,
        hourlyWeather
      );
      if (
        !document
          .querySelector(`.${styles.HourlyContainer}`)
          .contains(e.target) &&
        prevHourlyWeather.current === hourlyWeather &&
        visible
      ) {
        console.log(e.target.nodeName);
        prevHourlyWeather.current = "";
        removeVisible();
      } else if (visible) {
        prevHourlyWeather.current = hourlyWeather;
      }
    }
    document.addEventListener("click", mobileView ? effectClick : null);
    return () => {
      console.log("event listener removed WEEKLY");
      document.removeEventListener("click", effectClick);
    };
  }, [hourlyWeather, mobileView, visible, removeVisible]);
  const chartConfigMemo = useMemo(() => {
    return {
      chartData: {
        labels: hourlyWeather.time,
        datasets: [
          {
            data: hourlyWeather.temp,
            label: ``,
            fill: false,
            borderColor: mobileView ? "black" : "white",
            lineTension: 0.2,
          },
        ],
      },
      chartOptions: {
        plugins: {
          legend: {
            display: false, // remove dataset label rectangle
          },
          tooltip: {
            // interaction: {
            //   mode: "nearest",
            //   axis: "x",
            //   intersect: false,
            // },
            enabled: false,
            external: externalTooltip,
            callbacks: {
              title: function (chart) {
                return hourlyWeather.time[chart[0].dataIndex];
              },
              label: function (context) {
                return {
                  temp: hourlyWeather.temp[context.dataIndex],
                  weathercode: weatherCodeToIcon(
                    hourlyWeather.weathercode[context.dataIndex]
                  ),
                };
              },
            },
          },
        },
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
              display: !mobileView,
              text: "Temperature",
            },
          },
        },
        maintainAspectRatio: false, // set to false to make the chart responsive
        responsive: true, // set to true to make the chart responsive
        // animation: false, // set animation to false to achieve a smoother animation
      },
    };
  }, [hourlyWeather, mobileView]);
  return (
    <div
      className={`${styles["HourlyContainer"]}  ${
        visible && mobileView
          ? `HourlyContainerGlobal ${styles["visible"]}`
          : ""
      }`}
    >
      <header style={{ textAlign: "center" }}>
        Hourly Weather (
        {hourlyWeather.day === "Today"
          ? hourlyWeather.day
          : hourlyWeather.day + " " + hourlyWeather.date}
        )
      </header>

      <Line
        className={styles["chart"]}
        data={chartConfigMemo.chartData}
        options={chartConfigMemo.chartOptions}
      />
    </div>
  );
}
