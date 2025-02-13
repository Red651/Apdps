import axios from "axios";

export async function FetchReusable(url, method, headers = null) {
  try {
    const response = await axios[method](
      `${import.meta.env.VITE_APP_URL}${url}`,
      headers
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function PostReusable(url, method, data=null, headers = null) {
  try {
    const response = await axios[method](
      `${import.meta.env.VITE_APP_URL}${url}`,
      data,
      headers
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
