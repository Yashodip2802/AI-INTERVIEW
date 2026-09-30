import { useCallback, useContext } from "react";
import {
  generateInterviewReport,
  generateResumePdf,
  getAllInterviewReports,
  getInterviewReportById,
} from "../services/interview.api";
import InterviewContext from "../interview.context";

export const useInterview = () => {
  const context = useContext(InterviewContext);

  if (!context) {
    throw new Error("useInterview must be used within InterviewProvider");
  }

  const { loading, setLoading, report, setReport, reports, setReports } =
    context;

  const generateReport = async ({
    jobDescription,
    selfDescription,
    resumeFile,
  }) => {
    setLoading(true);
    try {
      const data = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });
      setReport(data.interviewReport);
      setReports((prev) => [data.interviewReport, ...prev]);
      return data.interviewReport;
    } catch (error) {
      console.error("Error generating interview report:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getReportById = useCallback(
    async (interviewId) => {
      setLoading(true);
      try {
        const data = await getInterviewReportById(interviewId);
        setReport(data);
        return data;
      } catch (error) {
        console.error("Error fetching interview report:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setReport],
  );

  const getReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllInterviewReports();
      setReports(data);
      return data;
    } catch (error) {
      console.error("Error fetching interview reports:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setReports]);

  const getResumePdf = async (interviewReportId) => {
    setLoading(true);
    let response = null;
    try {
      response = await generateResumePdf({ interviewReportId });
      const url = window.URL.createObjectURL(
        new Blob([response], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resume_${interviewReportId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    report,
    setReport,
    reports,
    setReports,
    generateReport,
    getReportById,
    getReports,
    getResumePdf,
  };
};
