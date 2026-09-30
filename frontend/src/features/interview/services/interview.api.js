import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 */
const generateInterviewReport = async ({
  jobDescription,
  selfDescription,
  resumeFile,
}) => {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription || "");
  if (resumeFile) {
    formData.append("resume", resumeFile);
  }

  const response = await api.post("/api/interview/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 */
const getInterviewReportById = async (interviewId) => {
  const response = await api.get(`/api/interview/report/${interviewId}`);
  return response.data.interviewReport;
};

/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 */
const getAllInterviewReports = async () => {
  const response = await api.get("/api/interview/");
  return response.data.interviewReports;
};

/**
 * @description Service to generate resume pdf based on user self description, resume content and job description.
 */
export const generateResumePdf = async ({ interviewReportId }) => {
  const response = await api.post(
    `/api/interview/resume/pdf/${interviewReportId}`,
    null,
    {
      responseType: "blob",
    },
  );

  return response;
};

export {
  generateInterviewReport,
  getInterviewReportById,
  getAllInterviewReports,
};
