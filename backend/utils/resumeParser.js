import fs from "fs";
import path from "path";
import * as mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

// Base skills dictionary (can be extended)
export const SKILLS_DB = [
  "react",
  "node",
  "mongodb",
  "express",
  "javascript",
  "html",
  "css",
  "python",
  "java",
  "sql",
  "aws",
];

// Simple synonym / normalization map
const SKILL_SYNONYMS = {
  reactjs: "react",
  "react.js": "react",
  "react js": "react",
  nodejs: "node",
  "node.js": "node",
  "node js": "node",
  "mongo db": "mongodb",
  "mongo-db": "mongodb",
  "js": "javascript",
  "javascript(es6)": "javascript",
  "amazon web services": "aws",
};

// Step 2: Extract text from uploaded resume file
export const extractTextFromResume = async (filePath, mimetype) => {
  if (!filePath) {
    throw new Error("File path is required to extract resume text");
  }

  const ext = path.extname(filePath).toLowerCase();

  // Handle PDF
  if (ext === ".pdf" || mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(filePath);

    // Use pdf-parse's PDFParse class for text extraction
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    const text = result?.text || "";

    // Clean up resources
    if (typeof parser.destroy === "function") {
      await parser.destroy();
    }

    return text;
  }

  // Handle DOCX (and docx mimetypes)
  if (
    ext === ".docx" ||
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const data = await mammoth.extractRawText({ path: filePath });
    return data.value || "";
  }

  throw new Error("Unsupported file type for resume parsing");
};

// Step 3: Clean and normalize text
export const normalizeText = (text) => {
  if (!text) return "";

  let cleaned = text.toLowerCase();

  // Replace common synonyms before removing special chars
  Object.entries(SKILL_SYNONYMS).forEach(([variant, base]) => {
    const pattern = new RegExp(`\\b${variant}\\b`, "gi");
    cleaned = cleaned.replace(pattern, ` ${base} `);
  });

  // Remove special characters, keep letters, numbers, and spaces
  cleaned = cleaned.replace(/[^a-z0-9\s]/g, " ");

  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
};

// Step 4: Skill extraction
export const extractSkills = (normalizedText) => {
  const found = new Set();

  if (!normalizedText) return [];

  SKILLS_DB.forEach((skill) => {
    const pattern = new RegExp(`\\b${skill}\\b`, "i");
    if (pattern.test(normalizedText)) {
      found.add(skill);
    }
  });

  return Array.from(found);
};

// Step 5: Experience extraction
export const extractTotalExperienceYears = (text) => {
  if (!text) return 0;

  let totalYears = 0;

  // Pattern: "X years experience" or "X+ years of experience"
  const yearsPattern =
    /(\d+)\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)/gi;
  let match;
  while ((match = yearsPattern.exec(text)) !== null) {
    const years = parseInt(match[1], 10);
    if (!Number.isNaN(years)) {
      totalYears = Math.max(totalYears, years);
    }
  }

  // Pattern: "YYYY - YYYY" or "YYYY- Present"
  const rangePattern =
    /(\d{4})\s*[-–]\s*(Present|Current|\d{4})/gi;
  const currentYear = new Date().getFullYear();
  while ((match = rangePattern.exec(text)) !== null) {
    const startYear = parseInt(match[1], 10);
    const endYearRaw = match[2];
    const endYear =
      /present|current/i.test(endYearRaw) || Number.isNaN(parseInt(endYearRaw, 10))
        ? currentYear
        : parseInt(endYearRaw, 10);

    if (!Number.isNaN(startYear) && !Number.isNaN(endYear) && endYear >= startYear) {
      const diff = endYear - startYear;
      totalYears = Math.max(totalYears, diff);
    }
  }

  return totalYears;
};

// Simple education extraction based on keywords
export const extractEducation = (text) => {
  if (!text) return "";

  const educationKeywords = [
    "bachelor",
    "master",
    "bsc",
    "b.sc",
    "btech",
    "b.tech",
    "be",
    "b.e",
    "mtech",
    "m.tech",
    "msc",
    "m.sc",
    "phd",
    "degree",
  ];

  const lines = text.split(/\r?\n/);
  const matchedLines = [];

  lines.forEach((line) => {
    const lower = line.toLowerCase();
    if (educationKeywords.some((kw) => lower.includes(kw))) {
      matchedLines.push(line.trim());
    }
  });

  return matchedLines.slice(0, 5).join(" | ");
};


