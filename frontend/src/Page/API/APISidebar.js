import axios from "axios";

export async function getStatusSidebar(job_type, job_phase) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/sidebar/${job_type}/${job_phase}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error get Data WellMaster", error);
    return error;
  }
}

export async function getJobWellSidebar(job_phase, job_type, job_status) {
  try {
    const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/jobget${job_phase}${job_type}/${job_status}`,

      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error get Data WellPlanning", error);
    return error;
  }
}

export async function getStatusSidebarKKKS(job_type, job_phase) {
  try {
    const kkks_id = JSON.parse(localStorage.getItem("user")).kkks_id;
    const response = await axios.get(`${import.meta.env.VITE_APP_URL}/job/kkks/${kkks_id}/sidebar/${job_type}/${job_phase}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error get Data Well Casing", error);
    return error;
  }
}

export async function getJobWellSidebarKKKS(job_phase, job_type, job_status) {
  try {
    const kkks_id = JSON.parse(localStorage.getItem("user")).kkks_id;
    const response = await axios.get(`${import.meta.env.VITE_APP_URL}/job/kkks/${kkks_id}/${job_phase}/${job_type}/${job_status}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error get Data WellPlanning", error);
    return error;
  }
}