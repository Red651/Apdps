import React, { useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import ModalDetailK3S from "./ModalDetailK3S";

const TableComponent = ({ data = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKkksId, setSelectedKkksId] = useState(null); // State for storing the selected ID

  const getBackgroundColor = (value) => {
    // Menghapus simbol "%" dan mengonversi menjadi angka
    // value = parseFloat(value.split("%")[0]);
  
    if (value >= 70) {
      return "#28a745"; // Green
    } else if (value >= 50) {
      return "#ffc107"; // Yellow
    } else if (value >= 30) {
      return "#fd7e14"; // Orange
    } else {
      return "#dc3545"; // Red
    }
  };
  
  // Contoh penggunaan
  
  
  // 
  

  const handleInfoClick = (item) => {
    setSelectedKkksId(item.id); // Save the selected ID
      setIsModalOpen(true); // Open the modal
    //   alert(item.id)
  };

  return (
    <>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "8px", borderBottom: "2px solid #ddd", color: "#6B7280"}} >INFO</th>
            <th style={{ padding: "8px", borderBottom: "2px solid #ddd", color: "#6B7280" }}>KKKS</th>
            <th style={{ padding: "8px", borderBottom: "2px solid #ddd", color: "#6B7280" }}>RENCANA WP&B 2024</th>
            <th style={{ padding: "8px", borderBottom: "2px solid #ddd", color: "#6B7280" }}>REALISASI</th>
            <th style={{ padding: "8px", borderBottom: "2px solid #ddd", color: "#6B7280" }}>%</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "8px", textAlign: "center" }}>
                <button
                  onClick={() => handleInfoClick(item)} // Call handleInfoClick with item
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  <AiOutlineInfoCircle color="#007bff" />
                </button>
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>{item.kkks}</td>
              <td style={{ padding: "8px", textAlign: "center" }}>{item.rencana}</td>
              <td style={{ padding: "8px", textAlign: "center" }}>{item.realisasi}</td>
              <td
                style={{
                  padding: "8px",
                  textAlign: "center",
                  backgroundColor: getBackgroundColor(item.persentase),
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {item.persentase}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ModalDetailK3S
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        kkks_id={selectedKkksId} // Pass the ID to the modal
      />
    </>
  );
};

export default TableComponent;
