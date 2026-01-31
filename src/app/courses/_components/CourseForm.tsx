"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/shared/TextInput";
import MultiSelect from "@/components/shared/MultiSelect";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useCreateCourse,
  useUpdateCourse,
  type CourseType,
} from "../../_components/hooks/courses.hooks";
import { useGetFacultyMembers } from "../../_components/hooks/facultyMembers.hooks";
import { Edit3, Plus } from "lucide-react";

interface CourseFormProps {
  instance?: CourseType | null;
  iconOnly?: boolean;
}

const CourseValidation = () =>
  yup.object().shape({
    course_name: yup.string().required("Course Name is Required"),
    course_code: yup.string().nullable(),
    credits: yup
      .number()
      .nullable()
      .typeError("Credits must be a number")
      .required("Credits is Required")
      .min(0, "Credits must be 0 or greater"),
    faculty_members: yup
      .array()
      .of(yup.string())
      .min(1, "At least one Faculty Member is Required")
      .required("Faculty Members is Required"),
  });

const CourseForm: React.FC<CourseFormProps> = ({ instance = null, iconOnly = false }) => {
  const [open, setOpen] = useState(false);
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse(instance?._id || "temp");
  const { data: facultyMembersData } = useGetFacultyMembers(1, 100, "");

  const isEditMode = !!instance;

  // Prepare faculty members options for MultiSelect
  const facultyMemberOptions =
    facultyMembersData?.results?.map((member) => ({
      value: member._id,
      label: member.name,
    })) || [];

  const {
    handleChange,
    values,
    touched,
    errors,
    handleSubmit,
    resetForm,
    setValues,
    setFieldValue,
  } = useFormik({
    initialValues: {
      course_name: instance?.course_name || "",
      course_code: instance?.course_code || "",
      credits: instance?.credits ?? null,
      faculty_members: instance?.faculty_members
        ? instance.faculty_members.map((member: any) =>
            typeof member === "string" ? member : member._id || member
          )
        : [],
    },
    validationSchema: CourseValidation,
    enableReinitialize: true,
    onSubmit: async (data) => {
      try {
        const payload = {
          course_name: data.course_name,
          course_code: data.course_code || undefined,
          credits: data.credits !== null ? Number(data.credits) : 0,
          faculty_members: data.faculty_members,
        };

        if (isEditMode) {
          const result = await updateCourse.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Course updated successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to update course");
          }
        } else {
          const result = await createCourse.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Course created successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to create course");
          }
        }
      } catch (error: any) {
        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((key: { attr: string; detail: string }) => {
            toast.error(`${key?.attr} - ${key?.detail}`);
          });
        } else {
          toast.error(error?.message || "An error occurred");
        }
      }
    },
  });

  useEffect(() => {
    if (instance && open) {
      setValues({
        course_name: instance.course_name || "",
        course_code: instance.course_code || "",
        credits: instance.credits ?? null,
        faculty_members: instance.faculty_members
          ? instance.faculty_members.map((member: any) =>
              typeof member === "string" ? member : member._id || member
            )
          : [],
      });
    } else if (!instance && open) {
      setValues({
        course_name: "",
        course_code: "",
        credits: null,
        faculty_members: [],
      });
    }
  }, [instance, open, setValues]);

  const isLoading = isEditMode
    ? updateCourse.isPending
    : createCourse.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <button className="text-green-600 cursor-pointer">
            <Edit3 className="w-5 h-5" />
          </button>
        ) : iconOnly ? (
          <button className="text-t-gray p-2.5 border border-t-gray cursor-pointer hover:text-t-orange transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <Button>
            Create Course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-t-black text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {isEditMode ? "Edit Course" : "Create Course"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-2 mt-2">
          <Label htmlFor="course_name" className="text-sm text-white/60">
            Course Name
          </Label>
          <TextInput
            id="course_name"
            type="text"
            name="course_name"
            onChange={handleChange}
            value={values.course_name}
            error={
              Boolean(errors.course_name) && touched.course_name
                ? errors.course_name
                : undefined
            }
            placeholder="Course name"
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="course_code" className="text-sm text-white/60">
                Course Code (Optional)
              </Label>
              <TextInput
                id="course_code"
                type="text"
                name="course_code"
                onChange={handleChange}
                value={values.course_code}
                error={
                  Boolean(errors.course_code) && touched.course_code
                    ? errors.course_code
                    : undefined
                }
                placeholder="Course code"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="credits" className="text-sm text-white/60">
                Credits
              </Label>
              <TextInput
                id="credits"
                type="number"
                name="credits"
                onChange={handleChange}
                value={values.credits ?? ""}
                error={
                  Boolean(errors.credits) && touched.credits ? errors.credits : undefined
                }
                placeholder="Credits"
                min="0"
                step="1"
              />
            </div>
          </div>

          <Label htmlFor="faculty_members" className="text-sm text-white/60">
            Faculty Members
          </Label>
          <MultiSelect
            options={facultyMemberOptions}
            value={values.faculty_members}
            onChange={(value) => setFieldValue("faculty_members", value)}
            placeholder="Select faculty members..."
          />
          {Boolean(errors.faculty_members) && touched.faculty_members && (
            <p className="text-orange-400 px-2 pt-2 text-sm">
              {errors.faculty_members as string}
            </p>
          )}

          <div className="mt-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Course"
                : "Create Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseForm;
