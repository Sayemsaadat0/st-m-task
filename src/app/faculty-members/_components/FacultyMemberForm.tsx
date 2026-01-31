"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/shared/TextInput";
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
  useCreateFacultyMember,
  useUpdateFacultyMember,
  type FacultyMemberType,
} from "../../_components/hooks/facultyMembers.hooks";
import { useGetFaculty } from "../../_components/hooks/faculty.hooks";
import { Edit3, Plus } from "lucide-react";

interface FacultyMemberFormProps {
  instance?: FacultyMemberType | null;
  iconOnly?: boolean;
}

const FacultyMemberValidation = () =>
  yup.object().shape({
    name: yup.string().required("Name is Required"),
    faculty_id: yup.string().required("Faculty is Required"),
  });

const FacultyMemberForm: React.FC<FacultyMemberFormProps> = ({ instance = null, iconOnly = false }) => {
  const [open, setOpen] = useState(false);
  const createFacultyMember = useCreateFacultyMember();
  const updateFacultyMember = useUpdateFacultyMember(instance?._id || "temp");
  const { data: facultyData } = useGetFaculty(1, 100, "");

  const isEditMode = !!instance;

  const {
    handleChange,
    values,
    touched,
    errors,
    handleSubmit,
    resetForm,
    setValues,
  } = useFormik({
    initialValues: {
      name: instance?.name || "",
      faculty_id: instance?.faculty_id
        ? typeof instance.faculty_id === "string"
          ? instance.faculty_id
          : instance.faculty_id._id || ""
        : "",
    },
    validationSchema: FacultyMemberValidation,
    enableReinitialize: true,
    onSubmit: async (data) => {
      try {
        const payload = {
          name: data.name,
          faculty_id: data.faculty_id,
        };

        if (isEditMode) {
          const result = await updateFacultyMember.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Faculty member updated successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to update faculty member");
          }
        } else {
          const result = await createFacultyMember.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Faculty member created successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to create faculty member");
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
        name: instance.name || "",
        faculty_id: instance.faculty_id
          ? typeof instance.faculty_id === "string"
            ? instance.faculty_id
            : instance.faculty_id._id || ""
          : "",
      });
    } else if (!instance && open) {
      setValues({
        name: "",
        faculty_id: "",
      });
    }
  }, [instance, open, setValues]);

  const isLoading = isEditMode
    ? updateFacultyMember.isPending
    : createFacultyMember.isPending;

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
            Create Faculty Member
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-t-black text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {isEditMode ? "Edit Faculty Member" : "Create Faculty Member"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-2 mt-2">
          <Label htmlFor="name" className="text-sm text-white/60">
            Name
          </Label>
          <TextInput
            id="name"
            type="text"
            name="name"
            onChange={handleChange}
            value={values.name}
            error={
              Boolean(errors.name) && touched.name ? errors.name : undefined
            }
            placeholder="Faculty member name"
          />

          <Label htmlFor="faculty_id" className="text-sm text-white/60">
            Faculty
          </Label>
          <select
            id="faculty_id"
            name="faculty_id"
            onChange={handleChange}
            value={values.faculty_id}
            className="w-full px-3 py-2 border border-t-gray/30 bg-t-black text-white outline-none h-11 placeholder-white/50 focus:border-t-green transition-colors"
          >
            <option value="">Select Faculty</option>
            {facultyData?.results?.map((faculty) => (
              <option key={faculty._id} value={faculty._id}>
                {faculty.name}
              </option>
            ))}
          </select>
          {Boolean(errors.faculty_id) && touched.faculty_id && (
            <p className="text-orange-400 px-2 pt-2 text-sm">
              {errors.faculty_id}
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
                ? "Update Faculty Member"
                : "Create Faculty Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FacultyMemberForm;
