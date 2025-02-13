import axios from "axios";

export async function ApproveJobKKS(job_id) {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_APP_URL}/job/planning/approve/${job_id}`,
        {}, // Tempatkan body data di sini jika diperlukan, saat ini dikosongkan
        {
          headers: {
            Accept: "application/json", // 'Accept' biasanya dengan 'A' besar
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response;
    } catch (error) {
      throw error.response;
    }
  }
  
