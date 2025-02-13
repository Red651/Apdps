import axios from "axios";
export const UploadWITSML = async (file, job_id) => {
  const formData = new FormData();
  // 
  formData.append("witsml_file", file);
  // 
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/job/operation/${job_id}/dor/witsml/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.status === 200) {
      
      return {
        status: response.status,

        message: response.data.message,
      };
    }
  } catch (error) {
    // console.error(error);
    if (error.status === 422) {
      throw {
        status: error.status,
        data: error.response.data.detail,
        message: error.response.statusText,
      };
    }
    if (error.status === 500) {
      throw {
        status: error.status,
        data: error.data.message,
        message: "Internal Server Error",
      };
    }
  }
};
