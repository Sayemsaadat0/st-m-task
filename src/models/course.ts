import { Schema, model, models, Types } from "mongoose";

const CourseSchema = new Schema(
  {
    course_name: {
      type: String,
      required: true,
      trim: true,
    },
    course_code: {
      type: String,
      required: false,
      trim: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 0,
    },
    faculty_members: {
      type: [Schema.Types.ObjectId],
      ref: "FacultyMember",
      default: [],
    },
    assignee: {
      type: [Schema.Types.ObjectId],
      ref: "Student",
      default: [],
    },
  },
  {
    timestamps: true,
    strictPopulate: false,
  }
);

// Delete cached model to force recompilation with new schema
if (models.Course) {
  delete models.Course;
}

const Course = model("Course", CourseSchema);

export { Course };
