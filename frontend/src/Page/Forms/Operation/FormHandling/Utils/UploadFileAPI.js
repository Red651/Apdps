import axios from "axios";

export const UploadFile = async (file) => {

  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/utils/upload/file`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    // 
    if (response.status === 200) {
      return {
        response: response,
        status: response.status,
        data: {
          file_id: response.data.data.file_info.id,
          filename: response.data.data.file_info.filename,
          file_location: response.data.data.file_info.file_location

        },
        message: response.data.message,
      };
    }
  } catch (error) {
    if(error.status === 422) {
      throw {
        response: error,
        status: error.response.status,
        title: "Form Validation Error",
        data: null,
        message: "Unprocessable Entity",

      };
    }
    if(error.status === 500) {
      throw {
        response: error,
        title: "Internal Server Error",
        status: error.response.status,
        data: null,
        message: "Please Contact Support",
      };
    }

    //  
    if(error.status === 401) {
      throw {
        response: error,
        title: "Unauthorized",
        status: error.response.status,
        data: null,
        message: "Could Not Authenticate User",
      };
    }
  }
};

