"use client";

import { message, Upload, UploadProps, UploadFile } from "antd";
import upload from "@/assets/upload.svg";
import React, { useState } from "react";
import Image from "next/image";
import Button from "../Button";
import { useForm } from "react-hook-form";
import { usePostContactMutation } from "@/redux/Api/contact";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

export default function ContactusForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [image, setImage] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  console.log(image, "imageUrls", imageUrls);

  const cloudName: string = "djftsbsuu";
  const uploadPreset: string = "syoung";

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  //uploade image
  const { Dragger } = Upload;
  const props: UploadProps = {
    name: "file",
    multiple: true,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        if (!(file instanceof File)) {
          throw new Error("Invalid file object");
        }
        const url = await uploadToCloudinary(file);
        setImageUrls((prev) => [...prev, url]);
        onSuccess?.(url);
      } catch (error) {
        onError?.(error as Error);
      }
    },
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
        setImage(info.fileList);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onRemove: (file) => {
      setImage((prev) => prev.filter((f) => f.uid !== file.uid));
      setImageUrls((prev) =>
        prev.filter((_, index) => index !== prev.length - 1)
      );
      return true;
    },
    fileList: image,
  };

  const [contactFn] = usePostContactMutation();
  const onSubmit = async (data: any) => {
    try {
      setUploading(true);

      // Submit form with already uploaded image URLs
      const res = await contactFn({
        name: data.name,
        email: data.email,
        zip: data.zip,
        picture: imageUrls,
        message: data.message,
        address: data.address,
        phone: data.phone,
      });
      console.log(res, "send");
      if (res?.data?.success) {
        toast.success(res?.data?.message);
        setImage([]); // Clear the image list after successful submission
        setImageUrls([]); // Clear the URLs
        reset(); // Reset all form fields to their default values
      }
    } catch (error: any) {
      toast.error(error?.message || "Error submitting form");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-background px-6 py-12 rounded-sm">
      <ToastContainer />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="text-textColor text-base font-semibold leading-normal"
          >
            Name:
          </label>
          <input
            {...register("name", {
              required: "Full name is required",
            })}
            type="text"
            className="border-2 border-[#AAA] p-4 w-full focus:outline-none focus:border-primary rounded-md mt-2"
            required
            placeholder="Enter your name "
          />
          {errors.name && (
            <p className="text-red-500 text-sm">
              {typeof errors.name?.message === "string" && errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="text-textColor text-base font-semibold leading-normal"
          >
            Email:
          </label>
          <input
            {...register("email", {
              required: "Email is required",
            })}
            type="email"
            className="border-2 border-[#AAA] p-4 w-full focus:outline-none focus:border-primary rounded-md mt-2"
            required
            placeholder="Enter your email "
          />
          {errors.email && (
            <p className="text-red-500 text-sm">
              {typeof errors.email?.message === "string" &&
                errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="text-textColor text-base font-semibold leading-normal"
          >
            Phone Number
          </label>
          <input
            {...register("phone", {
              required: "Phone number is required",
            })}
            type="text"
            className="border-2 border-[#AAA] p-4 w-full focus:outline-none focus:border-primary rounded-md mt-2"
            required
            placeholder="Enter Your Phone Number"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">
              {typeof errors.phone?.message === "string" &&
                errors.phone.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="address"
            className="text-textColor text-base font-semibold leading-normal"
          >
            Your Address
          </label>
          <input
            {...register("address", {
              required: "Address is required",
            })}
            type="text"
            className="border-2 border-[#AAA] p-4 w-full focus:outline-none focus:border-primary rounded-md mt-2"
            required
            placeholder="Enter Your Address"
          />
          {errors.address && (
            <p className="text-red-500 text-sm">
              {typeof errors.address?.message === "string" &&
                errors.address.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="zip"
            className="text-textColor text-base font-semibold leading-normal"
          >
            Your ZIP Code
          </label>
          <input
            {...register("zip", {
              required: "Zip Code is required",
            })}
            type="text"
            className="border-2 border-[#AAA] p-4 w-full focus:outline-none focus:border-primary rounded-md mt-2"
            required
            placeholder="Enter Your zip Code"
          />
          {errors.zip && (
            <p className="text-red-500 text-sm">
              {typeof errors.zip?.message === "string" && errors.zip.message}
            </p>
          )}
        </div>

        <div className=" bg-white rounded-md ">
          <Dragger {...props}>
            <div className="ant-upload-drag-icon flex items-center justify-center ">
              <Image
                src={upload}
                alt="upload"
                width={200}
                height={200}
                className="h-5 w-5"
              />
            </div>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Click or drag files to this area to upload. Images will be
              uploaded when you submit the form.
            </p>
          </Dragger>
          {uploading && <p className="mt-2">Uploading images...</p>}
          <div  className="flex gap-1 flex-wrap">
          {imageUrls &&
            imageUrls.map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  alt="uploading"
                  height={60}
                  width={60}
                />
              ))}
              </div>
        </div>
        <div>
          <label
            htmlFor="name"
            className="text-textColor text-base font-semibold leading-normal"
          >
            Your Message
          </label>
          <textarea
            {...register("message", {
              required: "Message is required",
            })}
            className="border-2 border-[#AAA] p-4 w-full focus:outline-none focus:border-primary rounded-md mt-2"
            required
            rows={5}
            placeholder="Enter Your Message"
          />
          {errors.message && (
            <p className="text-red-500 text-sm">
              {typeof errors.message?.message === "string" &&
                errors.message.message}
            </p>
          )}
        </div>

        <Button type="submit" variant="primary">
          Send now
        </Button>
      </form>
    </div>
  );
}
