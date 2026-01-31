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
  useCreateFaculty,
  useUpdateFaculty,
  type FacultyType,
} from "../../_components/hooks/faculty.hooks";
import { Edit3, Plus } from "lucide-react";

interface FacultyFormProps {
  instance?: FacultyType | null;
  iconOnly?: boolean;
}

const FacultyValidation = () =>
  yup.object().shape({
    name: yup.string().required("Name is Required"),
  });

const FacultyForm: React.FC<FacultyFormProps> = ({ instance = null, iconOnly = false }) => {
  const [open, setOpen] = useState(false);
  const createFaculty = useCreateFaculty();
  const updateFaculty = useUpdateFaculty(instance?._id || "temp");

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
    },
    validationSchema: FacultyValidation,
    enableReinitialize: true,
    onSubmit: async (data) => {
      try {
        const payload = {
          name: data.name,
        };

        if (isEditMode) {
          const result = await updateFaculty.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Faculty updated successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to update faculty");
          }
        } else {
          const result = await createFaculty.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Faculty created successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to create faculty");
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
      });
    } else if (!instance && open) {
      setValues({
        name: "",
      });
    }
  }, [instance, open, setValues]);

  const isLoading = isEditMode
    ? updateFaculty.isPending
    : createFaculty.isPending;

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
            Create Faculty
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-t-black text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {isEditMode ? "Edit Faculty" : "Create Faculty"}
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
            placeholder="Faculty name"
          />

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
                ? "Update Faculty"
                : "Create Faculty"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FacultyForm;
