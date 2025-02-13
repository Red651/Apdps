import React from "react";
import Plot from "react-plotly.js";

const ThreeDBarChartComponent = ({ datas, layouts }) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Ags",
    "Sep",
    "Okt",
    "Nop",
    "Des",
  ];

  const rencanaData = [51, 46, 56, 53, 61, 56, 51, 56, 60, 50, 45, 53];
  const realisasiData = [49, 48, 53, 56, 59, 51, 46, 42, 55, 66, 75, 90];

  const trace1 = {
    x: months,
    y: rencanaData,
    name: "Rencana",
    type: "bar",
    marker: {
      color: "rgb(41,171,226)",
    },
  };

  const trace2 = {
    x: months,
    y: realisasiData,
    name: "Realisasi",
    type: "bar",
    marker: {
      color: "rgb(243,146,0)",
    },
  };

  const data = [trace1, trace2];

  const layout = {
    title: "Rencana vs Realisasi",
    scene: {
      xaxis: { title: "Bulan" },
      yaxis: { title: "Nilai", range: [0, 70] },
      zaxis: { title: "" },
      camera: {
        eye: { x: 1.5, y: -1.5, z: 0.5 },
        center: { x: 0, y: 0, z: -0.1 },
      },
    },
    barmode: "group",
    bargap: 0.15,
    bargroupgap: 0.1,
    legend: {
      x: 0.8,
      y: 1.05,
      orientation: "h",
    },
    margin: {
      l: 50,
      r: 50,
      b: 50,
      t: 50,
      pad: 4,
    },
    paper_bgcolor: "rgb(240,240,240)",
    plot_bgcolor: "rgb(240,240,240)",
  };

  const config = {
    displayModeBar: false,
  };

  return (
    <Plot
      background="rgb(255, 255, 255)"
      data={datas}
      layout={layouts}
      config={config}
      style={{ width: "100%", height: "300px" }}
    />
  );
};

export default ThreeDBarChartComponent;
