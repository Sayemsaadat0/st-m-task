import { Schema, model, models } from "mongoose";

const FacultyMemberSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    faculty_id: {
      type: Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const FacultyMember = models.FacultyMember || model("FacultyMember", FacultyMemberSchema);

export { FacultyMember };
