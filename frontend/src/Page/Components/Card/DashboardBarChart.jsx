import React from "react";
import Plot from 'react-plotly.js';

const DashboardBarChart = () => {
  const data = [
    {
      x: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "1"],
      y: [600, 50, 520, 450, 750, 820, 850, 550, 450, 150, 900],
      type: "bar",
      name: "Series 1",
      marker: { color: "#82ca9d" },
    },
    {
      x: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "1"],
      y: [550, 850, 120, 600, 600, 300, 650, 350, 50, 600, 0],
      type: "bar",
      name: "Series 2",
      marker: { color: "#8884d8" },
    },
  ];

  const layout = {
    title: "Bar Chart",
    barmode: "group",
    xaxis: { title: "X Axis" },
    yaxis: { title: "Y Axis ('000)", range: [0, 1000] },
    legend: { orientation: "h", y: -0.2 },
    width: 800,
    height: 320,
  };

  return <Plot data={data} layout={layout} config={{ responsive: true }} />;
};

export default DashboardBarChart;
