import { Schema, model, models } from "mongoose";

const FacultySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    courses: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Faculty = models.Faculty || model("Faculty", FacultySchema);

export { Faculty };
