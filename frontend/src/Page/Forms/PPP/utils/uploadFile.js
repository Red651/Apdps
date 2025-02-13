import { PostUploadFile } from "../../../API/PostKkks";

const UploadFile = async (file) => {
    // 
    if(!file) {
        return {
            success: false,
            message: "No file selected",
        };
    }
    const form = new FormData();
    form.append("file", file);
    try {
        const response = await PostUploadFile(form);
        return {
            success: true,
            data: response.data.data,
            message: "File uploaded successfully",
        };
    } catch (error) {
        console.error(error);
        throw error;
    }

};

export default UploadFile