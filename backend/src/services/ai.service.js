import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import puppeteer from "puppeteer";

function getGenAIClient() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Set GOOGLE_GENAI_API_KEY (or GEMINI_API_KEY) in your environment.",
    );
  }
  return new GoogleGenAI({ apiKey });
}

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job describe",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in the interview along with their intention and how to answer them",
    ),
  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question can be asked in the interview"),
        intention: z
          .string()
          .describe("The intention of interviewer behind asking this question"),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
    ),
  skillGaps: z
    .array(
      z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe(
            "The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances",
          ),
      }),
    )
    .describe(
      "List of skill gaps in the candidate's profile along with their severity",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("The day number in the preparation plan, starting from 1"),
        focus: z
          .string()
          .describe(
            "The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc.",
          ),
        tasks: z
          .array(z.string())
          .describe(
            "List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.",
          ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
    ),
  title: z
    .string()
    .describe(
      "The title of the job for which the interview report is generated",
    ),
});

function normalizeInterviewReport(rawReport) {
  const report = rawReport && typeof rawReport === "object" ? rawReport : {};

  const technicalQuestions = Array.isArray(report.technicalQuestions)
    ? report.technicalQuestions.map((item) => {
        if (typeof item === "string") {
          return {
            question: item,
            intention: "Assess technical depth and practical decision-making.",
            answer:
              "Use a structured answer with context, approach, trade-offs, and concrete outcomes.",
          };
        }
        if (item && typeof item === "object") {
          return {
            question: String(item.question ?? ""),
            intention: String(
              item.intention ??
                "Assess technical depth and practical decision-making.",
            ),
            answer: String(
              item.answer ??
                "Use a structured answer with context, approach, trade-offs, and concrete outcomes.",
            ),
          };
        }
        return null;
      })
    : [];

  const behavioralQuestions = Array.isArray(report.behavioralQuestions)
    ? report.behavioralQuestions.map((item) => {
        if (typeof item === "string") {
          return {
            question: item,
            intention:
              "Assess collaboration, ownership, communication, and adaptability.",
            answer:
              "Answer using STAR format with measurable impact and key lessons.",
          };
        }
        if (item && typeof item === "object") {
          return {
            question: String(item.question ?? ""),
            intention: String(
              item.intention ??
                "Assess collaboration, ownership, communication, and adaptability.",
            ),
            answer: String(
              item.answer ??
                "Answer using STAR format with measurable impact and key lessons.",
            ),
          };
        }
        return null;
      })
    : [];

  const skillGaps = Array.isArray(report.skillGaps)
    ? report.skillGaps.map((item) => {
        if (typeof item === "string") {
          return { skill: item, severity: "medium" };
        }
        if (item && typeof item === "object") {
          return {
            skill: String(item.skill ?? ""),
            severity:
              item.severity === "low" ||
              item.severity === "medium" ||
              item.severity === "high"
                ? item.severity
                : "medium",
          };
        }
        return null;
      })
    : [];

  const preparationPlan = Array.isArray(report.preparationPlan)
    ? report.preparationPlan.map((item, index) => {
        if (typeof item === "string") {
          return { day: index + 1, focus: item, tasks: [item] };
        }
        if (item && typeof item === "object") {
          const tasks = Array.isArray(item.tasks)
            ? item.tasks.map((task) => String(task))
            : item.focus
              ? [String(item.focus)]
              : [];

          return {
            day:
              typeof item.day === "number" && Number.isFinite(item.day)
                ? item.day
                : index + 1,
            focus: String(item.focus ?? ""),
            tasks,
          };
        }
        return null;
      })
    : [];

  return {
    matchScore:
      typeof report.matchScore === "number" ? report.matchScore : Number.NaN,
    technicalQuestions: technicalQuestions.filter(Boolean),
    behavioralQuestions: behavioralQuestions.filter(Boolean),
    skillGaps: skillGaps.filter(Boolean),
    preparationPlan: preparationPlan.filter(Boolean),
    title: String(report.title ?? ""),
  };
}

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const ai = getGenAIClient();

  const prompt = `
You are an AI interview assistant.

Generate an interview preparation report for the candidate.

Return ONLY valid JSON that strictly follows this schema:
- matchScore (number 0-100)
- technicalQuestions (array)
- behavioralQuestions (array)
- skillGaps (array)
- preparationPlan (array)
- title (string)

Candidate Information:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
    },
  });

  const text = response.text.trim();

  console.log("Raw AI response:", text);

  const parsed = JSON.parse(text);
  const normalized = normalizeInterviewReport(parsed);
  const validated = interviewReportSchema.parse(normalized);

  return validated;
}

const generatePdfFromHtml = async (htmlContent) => {
  const launchOptions = {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  };

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  } else if (process.platform === "win32") {
    launchOptions.channel = "chrome";
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "15mm",
      right: "15mm",
    },
  });

  await browser.close();

  return pdfBuffer;
};

const generateResumePdf = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {
  const ai = getGenAIClient();
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
      ),
  });

  const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  const jsonContent = JSON.parse(response.text);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  return pdfBuffer;
};

export { generateInterviewReport, generateResumePdf };
