import axios from "axios";
import { useToast } from "@chakra-ui/react";

export async function PostWorkover(data) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/job/planning/create/workover`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Submit Data", error);
    throw error;
  }
}

export async function CreateRig(data) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/rig/create`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Error Dalam Kirim Data", error);

    if (error.response) {
      console.error("Response Error Data:", error.response.data);
      throw error.response;
    } else if (error.request) {
      console.error("No Response:", error.request);
      throw { message: "No response from server." };
    } else {
      console.error("Request Error:", error.message);
      throw { message: error.message };
    }
  }
}

export async function PostWellService(data) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/job/planning/create/wellservice`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Table", error);
    throw error;
  }
}

export async function PostOperationReport(job_id, data) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/job/operation/${job_id}/dor/save/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return response;
  } catch (error) {
    // console.error("Error get Data Table", error);
    throw error;
  }
}

// ANCHOR POST WRM ISSUES
export async function createJobIssue(job_id, data) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/job/operation/${job_id}/issues/create/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return response;
  } catch (error) {
    throw error;
  }
}
// ANCHOR PATCH WRM ISSUES
export const updateJobIssue = async (issueId, data) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_APP_URL}/job/issues/${issueId}/resolve`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job issue", error);
  }
};

// ANCHOR PATCH STATUS OPERATION TO OPERATE

export const patchStatusOperationToOperate = async (jod_id, formData) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_APP_URL}/job/operation/operate/${jod_id}`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Error updating job issue", error);
  }
};

export const putPlanningUpdate = async (job_id, data, job_type) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_APP_URL}/job/operation/${job_id}/update-${job_type}`,
      data,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job issue", error);
    throw error;
  }
};

export const UploadFileBatch = async (file, job_type) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/job/planning/upload-batch/${job_type}`,
      file,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// export async function GetDataMaps (data) {

export const DeleteJobPlanning = async (job_id) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_URL}/job/planning/delete/${job_id}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const PostUploadFile = async (file) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/utils/upload/file`,
      file,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const PostUploadPhysicalItem = async (file) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/utils/upload/physical-item`,
      file,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const postWellMaster = async (data) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/well/existing/create`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error create Well Master", error);
  }
};

export const editWellMaster = async (well_id, data) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_APP_URL}/well/existing/${well_id}/edit`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job issue", error);
  }
};

export const editRig = async (rig_id, data) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_APP_URL}/rig/${rig_id}/edit`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job issue", error);
  }
};

export const PatchFinishOperation = async (job_id, data) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_APP_URL}/job/operation/${job_id}/finish`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job issue", error);
    throw error;
  }
};

export const deleteWellMaster = async (well_id) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_URL}/well/existing/${well_id}/delete`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating job issue", error);
  }
};

export const deleteRig = async (rig_id) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_URL}/rig/${rig_id}/delete`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error delete Rig", error);
  }
};

///POST PPP

export const PostPPP = async (job_id, formData) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_APP_URL}/job/ppp/${job_id}/propose`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    // if(response.data.status === 200){
    //   return {
    //     data: response.data.data,
    //     message: response.data.message
    //   }
    // }

    return {
      data: "Fetching Succes",
      message: response.data.message,
      status: 200,
      status: 200,
    };
  } catch (error) {
    throw error;
  }
};

export const postCloseOut = async (job_id, data) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_APP_URL}/job/co/${job_id}/update`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return {
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw error;
  }
};

export const UpdateDataPlanning = async (job_id, data, job_phase) => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_APP_URL}/job/planning/${job_phase}/${job_id}`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return response;
  } catch (error) {
    throw error;
  }
};


