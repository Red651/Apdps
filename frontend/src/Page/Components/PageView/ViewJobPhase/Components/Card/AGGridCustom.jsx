import React from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';

const TableComponent = ({ data = [] }) => {  // Default nilai data menjadi array kosong
    // Fungsi untuk menentukan warna latar belakang berdasarkan nilai persentase
    const getBackgroundColor = (value) => {
        if (value >= 70) {
            return '#28a745'; // Hijau
        } else if (value >= 50) {
            return '#ffc107'; // Kuning
        } else if (value >= 30) {
            return '#fd7e14'; // Oranye
        } else {
            return '#dc3545'; // Merah
        }
    };

    // Fungsi untuk menangani klik tombol info
    const handleInfoClick = (item) => {
        alert(`Detail info untuk ${item.kkks}`);
    };

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>INFO</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>KKKS</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>RENCANA WP&B 2024</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>REALISASI</th>
                    <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>%</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                            <button
                                onClick={() => handleInfoClick(item)}
                                style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                }}
                            >
                                <AiOutlineInfoCircle color="#007bff" />
                            </button>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.kkks}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.rencana}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{item.realisasi}</td>
                        <td
                            style={{
                                padding: '8px',
                                textAlign: 'center',
                                backgroundColor: getBackgroundColor(item.persentase),
                                color: '#fff',
                                fontWeight: 'bold',
                            }}
                        >
                            {item.persentase}%
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TableComponent;
