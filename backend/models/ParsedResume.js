import mongoose from "mongoose";

const parsedResumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one parsed resume per user (latest)
    },
    fileName: {
      type: String,
    },
    skills: [
      {
        type: String,
      },
    ],
    totalExperienceYears: {
      type: Number,
      default: 0,
    },
    education: {
      type: String,
    },
    resumeText: {
      type: String,
    },
    meta: {
      // for caching / duplicate detection if needed
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

const ParsedResume = mongoose.model("ParsedResume", parsedResumeSchema);
export default ParsedResume;



