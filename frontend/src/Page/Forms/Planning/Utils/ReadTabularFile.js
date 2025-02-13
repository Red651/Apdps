import axios from "axios";

export const readTabularFile = async (file, type) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/utils/upload-and-read/tabularfile`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    // 
    // 
    const headers = response.data.data.data.headers.map((header) => ({
      Header: header,
      accessor: header, // Sesuaikan jika perlu
    }));
    
    return {
      status: response.status,
      message: response.data.message,
      data: {
        headers: headers,
        item: response.data.data.data.records,
        filename: response.data.data.file_info.filename,
        file_id: response.data.data.file_info.id,
      },
    };
  } catch (error) {
    throw error;
  }

  
};
