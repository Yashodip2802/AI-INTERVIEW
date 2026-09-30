import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import path from "path";

import {
  generateInterviewReport,
  generateResumePdf,
} from "../services/ai.service.js";
import interviewReportModel from "../models/interviewRepoert.model.js";

/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
const generateInterViewReportController = async (req, res) => {
  const resumeFile = req.file;

  try {
    let resumeText = "";

    if (resumeFile && resumeFile.buffer) {
      const ext = path.extname(resumeFile.originalname || "").toLowerCase();
      try {
        if (
          ext === ".docx" ||
          resumeFile.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const docxResult = await mammoth.extractRawText({
            buffer: resumeFile.buffer,
          });
          resumeText = docxResult.value || "";
        } else {
          const parser = new PDFParse({ data: resumeFile.buffer });
          const parsed = await parser.getText();
          resumeText = parsed?.text || "";
        }
      } catch (parseError) {
        console.error("Error parsing resume document:", parseError);
        return res.status(400).json({
          error:
            "Could not read resume file. Please ensure it is a valid PDF or DOCX document.",
        });
      }
    }

    const { selfDescription, jobDescription } = req.body;

    const interviewReportByAi = await generateInterviewReport({
      resume: resumeText,
      selfDescription: selfDescription || "",
      jobDescription,
    });

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeText,
      selfDescription: selfDescription || "",
      jobDescription,
      ...interviewReportByAi,
    });

    res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport,
    });
  } catch (error) {
    console.error("Error generating interview report:", error);
    res.status(500).json({ error: "Failed to generate interview report" });
  }
};

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
const getInterviewReportByIdController = async (req, res) => {
  const { interviewId } = req.params;

  try {
    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({ error: "Interview report not found" });
    }
    res.status(200).json({ interviewReport });
  } catch (error) {
    console.error("Error fetching interview report:", error);
    res.status(500).json({ error: "Failed to fetch interview report" });
  }
};

/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
const getAllInterviewReportsController = async (req, res) => {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({ interviewReports });
  } catch (error) {
    console.error("Error fetching interview reports:", error);
    res.status(500).json({ error: "Failed to fetch interview reports" });
  }
};

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
const generateResumePdfController = async (req, res) => {
  const { interviewReportId } = req.params;

  const interviewReport =
    await interviewReportModel.findById(interviewReportId);

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  const { resume, jobDescription, selfDescription } = interviewReport;

  const pdfBuffer = await generateResumePdf({
    resume,
    jobDescription,
    selfDescription,
  });

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
  });

  res.send(pdfBuffer);
};

export {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
