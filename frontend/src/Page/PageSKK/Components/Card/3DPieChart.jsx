import Plot from "react-plotly.js";

const PieChart3D = ({ data, layout }) => {
  return (
    <Plot
      data={data}
      layout={layout}
      style={{ width: "100%", height: "100%" }}
      config={{ displayModeBar: false }}
    />
  );
};

export default PieChart3D;
