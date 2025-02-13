import axios from "axios";

export async function getTableKKKS(kkks_id, job_type, job_phase) {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/dashboard/kkks/${kkks_id}/${job_type}/${job_phase}/jobs`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return response.data;
  }
}

export async function getAreaID() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/spatial/get/areas`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return null;
  }
}

export async function GetFieldID(area_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/spatial/get/fields/${area_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return response.data;
  }
}

export async function getExistingWellList(kkks_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/well/existing/list/${kkks_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return response.data;
  }
}

export async function GetWellStratigrapyh() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/spatial/api/areas`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    throw error.response;
  }
}

export async function GetCodeTimeBreakDown() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/utils/options/operation_code`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    throw error.response;
  }
}

export const getWRMIssues = async (jobId) => {
  return await axios
    .get(`${import.meta.env.VITE_APP_URL}/job/operation/${jobId}/issues/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then((response) => response.data);
};

export async function GetDateJobInstances(job_instance_id, dates) {
  return await axios.get(
    `${
      import.meta.env.VITE_APP_URL
    }/job/operation/${job_instance_id}/dor/dates/`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
}

export async function GetBHAEnum() {
  return await axios.get(
    `${import.meta.env.VITE_APP_URL}/utils/options/bha_component_type`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
}

export async function getViewRawPlanning(job_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/operation/${job_id}/get`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data view raw", error);
    return null;
  }
}

export async function GetViewRig(job_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/operation/${job_id}/get`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data view raw", error);
    return null;
  }
}

export async function GetRig(rig_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/rig/${rig_id}/get`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data view raw", error);
    return null;
  }
}

export async function getWellMaster(kkks_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/well/existing/get/${kkks_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return response.data;
  }
}

export async function getSummaryWellMaster(kkks_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/well/existing/summary/${kkks_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get well/existing/summary", error);
    return null;
  }
}

export async function getAllRigs(page, item) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/rig/all?page=${page}&page_size=${item}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return response.data;
  }
}

export async function getSummaryRig() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/rig/summary`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get well/existing/summary", error);
    return null;
  }
}

export async function getExistingWell(well_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/well/existing/${well_id}/get`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return response.data;
  }
}

export async function GetWellData(url) {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error get Data View Planning", error);
    return null;
  }
}

export async function getValidationValueOperation(job_id) {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_APP_URL}/job/operation/${job_id}/validate`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    return error;
  }
}

export async function getWellStatus() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/utils/options/well_status`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well Status", error);
    return response.data;
  }
}

export async function getCountDataSummary(kkks_id, job_type, job_phase) {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/dashboard/kkks/${kkks_id}/${job_type}/${job_phase}/summary`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well Status", error);
    return response.data;
  }
}

export async function getUserInfo() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/auth/user/me`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well Status", error);
    return response.data;
  }
}

export async function getLogoKKKS(kkks_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/auth/kkks/${kkks_id}/logo`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob",
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Image KKKS", error);
    return null;
  }
}

export async function getDashboardProgressSummary() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/all/progress/summary`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get dashboard/all/progress/summary", error);
    return null;
  }
}

export async function getGeoJSONKKKS(kkks_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/spatial/get/kkks-info/${kkks_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data GeoJSON KKKS", error);
    return null;
  }
}

export async function getCountDashboardSummary(kkks_id, job_type) {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/dashboard/kkks/${kkks_id}/${job_type}/summary`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data dashboard/kkks", error);
    return null;
  }
}

export async function getKKKSJobs(kkks_id, job_type) {
  kkks_id = JSON.parse(localStorage.getItem("user")).kkks_id;
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/dashboard/kkks/${kkks_id}/${job_type}/jobs`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Job KKKS", error);
    return null;
  }
}

export async function GetViewOperation(data) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/operation/${data}/view`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data View Planning", error);
    return null;
  }
}

export async function GetViewProposed(data) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/ppp/${data}/get`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data View Planning", error);
    return null;
  }
}

export async function GetViewTrajectory(url) {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error get Data View Planning", error);
    return null;
  }
}

export async function GetDailyReport(job_id, date) {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/job/operation/${job_id}/dor/${date}/view`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Daily Report", error);
    return null;
  }
}

export async function getWellCasing(path) {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error get Data Well Casing", error);
    return error;
  }
}

export async function getAFENumber(job_id) {
  const response = await axios.get(
    `${import.meta.env.VITE_APP_URL}/job/ppp/${job_id}/afe-info`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return response.data;
}

export async function getRigList() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/rig/list`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return error.response;
  }
}

// export async function pathExecute(path, type, options = {}) {
//   try {
//     const validTypes = ["get", "post", "put", "delete"];
//     if (!validTypes.includes(type.toLowerCase())) {
//       throw new Error("Invalid request type");
//     }

//     const config = {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//       ...options,
//     };
//      
//    // Periksa apakah responseType diatur ke 'blob'
//     // if (config.responseType === "blob") {
//        //       return response; // Kembalikan langsung respons untuk pengunduhan file
//     // }
//   } catch (error) {
//     console.error("Error in pathExecute:", error);
//     return null;
//   }
// }

export async function pathExecute(path, type, options = {}) {
  try {
    const validTypes = ["get", "post", "put", "delete"];
    if (!validTypes.includes(type.toLowerCase())) {
      throw new Error("Invalid request type");
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      responseType: "blob", // Pastikan responseType diatur ke 'blob' untuk unduhan file
      ...options,
    };

    const response = await axios[type](
      `${import.meta.env.VITE_APP_URL}${path}`,
      config
    );

    return response.data; // Kembalikan hanya data (blob)
  } catch (error) {
    console.error("Error in pathExecute:", error);
    return null;
  }
}

export async function fetchImage(path) {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_URL}${path}`, {
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

export const GetDataJobPlanning = async (job_id) => {
  try {
    const reponse = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/planning/get/${job_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return reponse;
  } catch (error) {
    throw error;
  }
};

export const getParentWell = async () => {
  try {
    const kkks_id = JSON.parse(localStorage.getItem("user")).kkks_id;
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/well/existing/list/${kkks_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well And Start Date", error);
    return null;
  }
};

export const getEnum = async (enum_name) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/utils/options/${enum_name}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return null;
  }
};

export const getDelete = async (file_id) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/utils/delete/file/${file_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return null;
  }
};

export const getView = async (file_id) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/utils/view-image/file/${file_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob", // Pastikan respons berupa blob
      }
    );
    return response.data; // Kembalikan blob
  } catch (error) {
    console.error("Error getting file for view:", error);
    return null;
  }
};
