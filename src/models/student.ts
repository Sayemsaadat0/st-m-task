import { Schema, model, models } from "mongoose";

const StudentSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    cgpa_point: {
      type: Number,
      required: true,
      min: 0,
      max: 4.0,
    },
    courses: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    grades: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    attributes: {
      type: [Schema.Types.Mixed],
      default: [],
      required: false,
    },
    progressSummary: {
      completedCourses: {
        type: Number,
        default: 0,
      },
      ongoingCourses: {
        type: Number,
        default: 0,
      },
      completedCredits: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Student = models.Student || model("Student", StudentSchema);

export { Student };
