"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import TextInput from "@/components/shared/TextInput";
import { TextAreaInput } from "@/components/shared/TextAreaInput";
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
  useCreateStudent,
  useUpdateStudent,
  type StudentType,
} from "../../_components/hooks/students.hooks";
import { Edit3, Plus, X } from "lucide-react";

interface StudentFormProps {
  instance?: StudentType | null;
  iconOnly?: boolean;
}

const StudentValidation = () =>
  yup.object().shape({
    first_name: yup.string().required("First Name is Required"),
    last_name: yup.string().required("Last Name is Required"),
    email: yup
      .string()
      .email("Email must be a valid email address")
      .required("Email is Required"),
    phone: yup.string().required("Phone is Required"),
    address: yup.string().required("Address is Required"),
    cgpa_point: yup
      .number()
      .nullable()
      .typeError("CGPA Point must be a number")
      .min(0, "CGPA Point must be 0 or greater")
      .max(4.0, "CGPA Point must be 4.0 or less"),
  });

const StudentForm: React.FC<StudentFormProps> = ({ instance = null, iconOnly = false }) => {
  const [open, setOpen] = useState(false);
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent(instance?._id || "temp");

  const isEditMode = !!instance;

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
      first_name: instance?.first_name || "",
      last_name: instance?.last_name || "",
      email: instance?.email || "",
      phone: instance?.phone || "",
      address: instance?.address || "",
      cgpa_point: instance?.cgpa_point ?? null,
      attributes: instance?.attributes && instance.attributes.length > 0
        ? instance.attributes.map((attr: any) => ({ key: attr.key || "", value: attr.value || "" }))
        : [{ key: "", value: "" }],
    },
    validationSchema: StudentValidation,
    enableReinitialize: true,
    onSubmit: async (data) => {
      try {
        // Filter out empty attributes
        const validAttributes = data.attributes
          .filter((attr: { key: string; value: string }) => attr.key.trim() && attr.value.trim())
          .map((attr: { key: string; value: string }) => ({
            key: attr.key.trim(),
            value: attr.value.trim(),
          }));

        const payload = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          cgpa_point: data.cgpa_point !== null ? Number(data.cgpa_point) : 0,
          attributes: validAttributes,
        };

        if (isEditMode) {
          const result = await updateStudent.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Student updated successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to update student");
          }
        } else {
          const result = await createStudent.mutateAsync(payload);
          if (result.success) {
            toast.success(result.message || "Student created successfully");
            resetForm();
            setOpen(false);
          } else {
            toast.error(result.message || "Failed to create student");
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
        first_name: instance.first_name || "",
        last_name: instance.last_name || "",
        email: instance.email || "",
        phone: instance.phone || "",
        address: instance.address || "",
        cgpa_point: instance.cgpa_point ?? null,
        attributes: instance.attributes && instance.attributes.length > 0
          ? instance.attributes.map((attr: any) => ({ key: attr.key || "", value: attr.value || "" }))
          : [{ key: "", value: "" }],
      });
    } else if (!instance && open) {
      setValues({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        cgpa_point: null,
        attributes: [{ key: "", value: "" }],
      });
    }
  }, [instance, open, setValues]);

  const addAttribute = () => {
    setFieldValue("attributes", [...values.attributes, { key: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    const newAttributes = values.attributes.filter((_: any, i: number) => i !== index);
    if (newAttributes.length === 0) {
      setFieldValue("attributes", [{ key: "", value: "" }]);
    } else {
      setFieldValue("attributes", newAttributes);
    }
  };

  const handleAttributeChange = (index: number, field: "key" | "value", value: string) => {
    const newAttributes = [...values.attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setFieldValue("attributes", newAttributes);
  };

  const isLoading = isEditMode
    ? updateStudent.isPending
    : createStudent.isPending;

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
            Create Student
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-t-black text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">
            {isEditMode ? "Edit Student" : "Create Student"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <form onSubmit={handleSubmit} className="space-y-2 mt-2">
          <Label htmlFor="first_name" className="text-sm text-white/60">
            First Name
          </Label>
          <TextInput
            id="first_name"
            type="text"
            name="first_name"
            onChange={handleChange}
            value={values.first_name}
            error={
              Boolean(errors.first_name) && touched.first_name
                ? errors.first_name
                : undefined
            }
            placeholder="First name"
          />

          <Label htmlFor="last_name" className="text-sm text-white/60">
            Last Name
          </Label>
          <TextInput
            id="last_name"
            type="text"
            name="last_name"
            onChange={handleChange}
            value={values.last_name}
            error={
              Boolean(errors.last_name) && touched.last_name
                ? errors.last_name
                : undefined
            }
            placeholder="Last name"
          />

          <Label htmlFor="email" className="text-sm text-white/60">
            Email
          </Label>
          <TextInput
            id="email"
            type="email"
            name="email"
            onChange={handleChange}
            value={values.email}
            error={
              Boolean(errors.email) && touched.email ? errors.email : undefined
            }
            placeholder="Email address"
          />

          <Label htmlFor="phone" className="text-sm text-white/60">
            Phone
          </Label>
          <TextInput
            id="phone"
            type="text"
            name="phone"
            onChange={handleChange}
            value={values.phone}
            error={
              Boolean(errors.phone) && touched.phone ? errors.phone : undefined
            }
            placeholder="Phone number"
          />

          <Label htmlFor="address" className="text-sm text-white/60">
            Address
          </Label>
          <TextAreaInput
            id="address"
            name="address"
            onChange={handleChange}
            value={values.address}
            error={
              Boolean(errors.address) && touched.address
                ? errors.address
                : undefined
            }
            placeholder="Address"
          />

          <Label htmlFor="cgpa_point" className="text-sm hidden text-white/60">
            CGPA Point
          </Label>
          <TextInput
            id="cgpa_point"
            type="number"
            name="cgpa_point"
            className="hidden"
            onChange={handleChange}
            value={values.cgpa_point ?? ""}
            error={
              Boolean(errors.cgpa_point) && touched.cgpa_point
                ? errors.cgpa_point
                : undefined
            }
            placeholder="CGPA (0-4.0)"
            step="0.01"
            min="0"
            max="4.0"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-white/60">
                Attributes
              </Label>
              <button
                type="button"
                onClick={addAttribute}
                className="text-t-green hover:text-t-orange transition-colors p-1"
                title="Add Attribute"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {values.attributes.map((attr: { key: string; value: string }, index: number) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <TextInput
                    type="text"
                    placeholder="Key"
                    value={attr.key}
                    onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <TextInput
                    type="text"
                    placeholder="Value"
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                  />
                </div>
                {values.attributes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="text-orange-400 hover:text-orange-500 transition-colors p-1 mt-1"
                    title="Remove Attribute"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

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
                ? "Update Student"
                : "Create Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;
