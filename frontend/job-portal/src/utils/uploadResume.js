import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosInstance";

// Upload resume file (PDF/DOCX) to backend parser
// Field name must be "resume" to match backend multer config
const uploadResume = async (resumeFile) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);

  try {
    const response = await axiosInstance.post(
      API_PATHS.RESUME.UPLOAD_RESUME,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data; // { source, parsedResume }
  } catch (error) {
    console.error("Error uploading/parsing the resume:", error);
    throw error;
  }
};

export default uploadResume;



