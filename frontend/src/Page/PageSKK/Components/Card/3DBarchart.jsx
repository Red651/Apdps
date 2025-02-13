import React from 'react';
import Plot from 'react-plotly.js';

const BarChartComponent = ({datas,layouts}) => {

  return (
    <Plot
      data={datas}
      layout={layouts}
      style={{ width: "100%", height: "100%" }}
      config={{ displayModeBar: false }}
  />
  );
};

export default BarChartComponent;