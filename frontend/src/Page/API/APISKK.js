import axios from "axios";
import { validationPostPutPlanning } from "../Forms/Planning/Utils/ValidationPlanning";

export async function getDataDashboardSKK() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/all/progress/summary`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data?.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return null;
  }
}

export async function getProgressKKKS() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/skk/progress/kkks`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data?.data;
  } catch (error) {
    console.error("Error get Data Progress KKKS", error);
    return null;
  }
}

export async function getJobDasboard(job_type) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/skk/${job_type}/progress`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    console.error("Error get Data Table", error);
    return null;
  }
}

export async function getJobInfo(job_type) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/all/progress/${job_type}/plot`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error get Job Info", error);
    return null;
  }
}

export async function getKKKSInfo(job_type) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/view-job/${job_type}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error get Data Table", error);
    return null;
  }
}

export async function getJobTypeSummarySKK() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/job-type-summary-skk`,
    );

    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return null;
  }
}

export async function getDataJobCountPlanningEx() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/job-counts/planning`,
    );

    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return null;
  }
}

export async function getRigTypePieChart() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/rig-type-pie-chart`,
    );

    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return null;
  }
}

export async function getBudgetSummaryCharts() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/budget-summary-charts`,
    );

    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return null;
  }
}

export async function getJobWellStatusChart() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/job-well-status-summary`,
    );

    return response.data;
  } catch (error) {
    console.error("Error get Data Well", error);
    return null;
  }
}

export async function getJobPhase(job_type, job_phase) {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/dashboard/skk/${job_type}/${job_phase}/summary`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well And Start Date", error);
    return null;
  }
}

export async function getCombinedData() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/combined-data`,
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well And Start Date", error);
    return null;
  }
}
export async function getDataOperation() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/data-operations`,
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well And Start Date", error);
    return null;
  }
}
export async function getDataPPP() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/data-p3`,
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well And Start Date", error);
    return null;
  }
}

export async function getDataTypeSummarySKK() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/job-type-summary-skk`,
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Well And Start Date", error);
    return null;
  }
}

export async function PostPlanningExploration(data) {
  
  try {
    
      // setFormErrors(validationPostPutPlanning(data))
      // validationPostPutPlanning(data);
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/job/planning/create/exploration`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response;
  } catch (error) {
    console.error("Error Dalam Kirim Data", error);

    // Jika error berasal dari response API (misalnya error 400 atau 500)
    if (error.response) {
      console.error("Response Error Data:", error.response.data);
      throw error.response; // Mengembalikan data error dari server
    } else if (error.request) {
      console.error("No Response:", error.request);
      throw { message: "No response from server." };
    } else {
      console.error("Request Error:", error.message);
      throw { message: error.message };
    }
  }
}

export async function GetOperasionalExploration(job_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/operation/${job_id}/get`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
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

export async function PutOperasionalExp(job_id) {
  try {
    const response = await axios.put(
      `${
        import.meta.env.VITE_APP_URL
      }/job/operation/${job_id}/update-exploration`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    return response;
  } catch (error) {
    console.error("Error Dalam Kirim Data", error);

    // Jika error berasal dari response API (misalnya error 400 atau 500)
    if (error.response) {
      console.error("Response Error Data:", error.response.data);
      throw error.response; // Mengembalikan data error dari server
    } else if (error.request) {
      console.error("No Response:", error.request);
      throw { message: "No response from server." };
    } else {
      console.error("Request Error:", error.message);
      throw { message: error.message };
    }
  }
}

//   API UNTUK PLANNING DEVELOPMENT

export async function PostPlanningDevelopment(data, toast) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/job/planning/create/development`,
      data,
      {
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    if (response.status === 200) {
      toast({
        title: "Data berhasil dikirim.",
        description: "Data telah berhasil disimpan ke database.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }

    return response;
  } catch (error) {
    console.error("Error Dalam Kirim Data", error);
    if (error.response.status === 422) {
      toast({
        title: "Terjadi kesalahan.",
        description: "Harap Periksa Kembali Form.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }

    if (error.response.status === 500) {
      toast({
        title: "Terjadi kesalahan.",
        description: "Data gagal dikirim ke server.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }
}

export async function GetViewPlanning(job_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/planning/view/${job_id}`,
      {
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data View Planning", error);
    return null;
  }
}

export async function GetViewRig(rig_id) {
  if (!rig_id) {
    console.error("Rig ID is undefined");
    return null;
  }

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/rig/${rig_id}/view`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data Rig:", error);
    return null;
  }
}

export async function ApprovePlanning(data) {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_APP_URL}/job/planning/approve/${data}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data View Planning", error);
    return null;
  }
}

export async function ReturnPlanning(data) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/planning/return/${data}`,
      [],
      {
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data View Planning", error);
    return null;
  }
}

export async function ApprovePPP(job_id) {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_APP_URL}/job/ppp/${job_id}/approve`,
      {}, // Mengirim payload kosong jika tidak ada data tambahan
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating status to APPROVED", error);
    return null;
  }
}

export async function GetImageWellCasing(path) {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      responseType: "blob", // Tambahkan ini untuk mendapatkan response sebagai blob
    });
    return response.data; // Mengembalikan blob dari gambar
  } catch (error) {
    console.error("Error get Data View Planning", error);
    return null;
  }
}

export async function GetDataWell(data) {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_URL}${data}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      responseType: "blob", // Tambahkan ini untuk mendapatkan response sebagai blob
    });
    return response.data; // Mengembalikan blob dari gambar
  } catch (error) {
    console.error("Error Get Data Well", error);
    return error;
  }
}

export async function patchWRM(job_id, formData, job_type) {
  try {
    if (!job_id) {
      throw new Error("Job ID is required");
    }
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/job/operation/${job_id}/wrm/update-${job_type}`,
      formData, // Mengirim formData dalam body
      {
        headers: {
          "Content-Type": "application/json", // Pastikan menggunakan JSON
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error updating WRM data", error);
    throw error;
  }
}

export async function getWRMPPercentValues(job_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/operation/${job_id}/wrm/progress`,
    );
    return response.data; // Kembalikan data yang relevan
  } catch (error) {
    console.error("Error fetching WRMP percent values:", error);
    throw error; // Lempar error untuk ditangani di tempat lain
  }
}

export async function getWRMData(job_id) {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/job/operation/${job_id}/wrm/requirements`,
      {
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    // console.error("Error get Data getWRMData", error);
    throw error;
  }
}

export async function GetDataStratigraphy(area_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/spatial/api/strat-units/${area_id}`,
      {
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data View Planning", error);
    return null;
  }
}

export async function GetDatas(url) {
  if (url) {
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
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data View Operation", error);
    return null;
  }
}

export async function PatchPropose(data) {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_URL}/job/ppp/${data}/propose`,
      {
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error Patch Propose", error);
    return null;
  }
}

export async function PatchReturn(job_id) {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_APP_URL}/job/ppp/${job_id}/return`,
      [],
      {
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error Patch Return", error);
    return null;
  }
}

export async function PatchApprove(job_id) {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_APP_URL}/job/ppp/${job_id}/approve`,
      [],
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error Patch Approve", error);
    return error;
  }
}

export async function GetViewPpp(data) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/ppp/${data}/afe-info`,
      {
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data View Operation", error);
    return null;
  }
}

export async function GetWRMProgress(data) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/operation/${data}/wrm/view`,
      {
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data WRM Progress", error);
    return null;
  }
}

export async function GetjobIssue(data) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/job/operation/${data}/issues/view`,
      {
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data View Operation", error);
    return null;
  }
}

export async function getSelfInfo(kkks_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/auth/kkks/${kkks_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getSelfInfo ", error);
    return null;
  }
}

export async function getGeoMap(kkks_id) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/spatial/get/kkks-info/${kkks_id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getGeoMap ", error);
    return null;
  }
}

export async function getJobTypeSummary(kkks_id, job_type) {
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
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getJobTypeSummary ", error);
    return null;
  }
}

export async function getKKKSJobs(kkks_id, job_type, page, page_size) {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/dashboard/kkks/${kkks_id}/${job_type}/jobs?page=${page}&page_size=${page_size}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getKKKSJobs ", error);
    return null;
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
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getLogoKKKS ", error);
    return null;
  }
}

export async function getProgressKKKSfromSKK(job_type, page, page_size) {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/dashboard/skk/${job_type}/progress/kkks?page=${page}&page_size=${page_size}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getProgressSKK ", error);
    return null;
  }
}

export async function getProgressKKKSWBS(job_type, page, page_size) {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/dashboard/skk/${job_type}/wrm?page=${page}&page_size=${page_size}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getProgressSKK ", error);
    return null;
  }
}

export async function getProgressKKKSIssues(job_type, page, page_size) {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/dashboard/skk/${job_type}/issues?page=${page}&page_size=${page_size}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getProgressSKK ", error);
    return null;
  }
}

export async function getPlotProgressKKKSIssues(job_type) {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/dashboard/skk/${job_type}/issues/plot`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getProgressSKK ", error);
    return null;
  }
}

export async function getProgressSKK(job_type, phase, page, page_size) {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/dashboard/skk/${job_type}/${phase}/jobs?page=${page}&page_size=${page_size}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getProgressSKK ", error);
    return null;
  }
}

export async function getWellMaster(page, item) {
  try {
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_URL
      }/well/existing/all?page=${page}&per_page=${item}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data WellMaster", error);
    return error;
  }
}

export async function getWellMasterSummary() {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_APP_URL}/well/existing/all/summary`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error get Data WellMaster", error);
    return error;
  }
}
export async function getWellCasingBar(url) {
  try {
    const response = await axios.get(`${import.meta.env.VITE_APP_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error get Data WellCasingBar", error);
    return error;
  }
}
