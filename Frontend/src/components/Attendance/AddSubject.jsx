import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SiDatabricks } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import AlertMessage from "../Alert/AlertMessage";
import { AddSubjectAPI } from "../../services/attendance/attendanceService";

// Validation schema
const validationSchema = Yup.object({
  subject: Yup.string().required("Subject name is required"),
  credit:Yup.number()
   .required("Credits are required"),
  attendedClasses: Yup.number()
    .required("Attended classes is required"),
    
  totalClasses: Yup.number()
    .required("Total classes is required")
});

const AddSubject = () => {
  const navigate = useNavigate();
  const { mutateAsync, isPending, isError, error, isSuccess } = useMutation({
    mutationFn: AddSubjectAPI,
    mutationKey: ["AddSubject"],
  });

  const formik = useFormik({
    initialValues: {
      subject: "",
      credit: 0,
      attendedClasses: 0,
      totalClasses: 1,
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values); // Check values before submission
      mutateAsync(values)
        .then((data) => {
          navigate("/dashboard");
        })
        .catch((e) => console.log(e));
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="max-w-lg mx-auto my-10 bg-white p-6 rounded-lg shadow-lg space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Add New Subject</h2>
        <p className="text-gray-600">Fill in the details below.</p>
      </div>

      {/* Display alert message */}
      {isError && (
        <AlertMessage
          type="error"
          message={error?.response?.data?.message || "Something happened, please try again later."}
        />
      )}
      {isSuccess && (
        <AlertMessage
          type="success"
          message="Subject added successfully, redirecting..."
        />
      )}

      {/* Subject Name */}
      <div className="flex flex-col">
        <label htmlFor="subject" className="text-gray-700 font-medium">
          <SiDatabricks className="inline mr-2 text-blue-500" />
          Subject Name
        </label>
        <input
          type="text"
          {...formik.getFieldProps("subject")}
          placeholder="Subject Name"
          id="subject"
          className="w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
        />
        {formik.touched.subject && formik.errors.subject && (
          <p className="text-red-500 text-xs italic">{formik.errors.subject}</p>
        )}
      </div>
      <div className="flex flex-col">
        <label htmlFor="credit" className="text-gray-700 font-medium">
          <SiDatabricks className="inline mr-2 text-blue-500" />
          Credits
        </label>
        <input
          type="number"
          {...formik.getFieldProps("credit")}
          placeholder="Subject Name"
          id="credit"
          className="w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
        />
        {formik.touched.credit && formik.errors.credit && (
          <p className="text-red-500 text-xs italic">{formik.errors.credit}</p>
        )}
      </div>

      {/* Total Classes */}
      <div className="flex flex-col">
        <label htmlFor="totalClasses" className="text-gray-700 font-medium">
          <SiDatabricks className="inline mr-2 text-blue-500" />
          Total Classes
        </label>
        <input
          type="number"
          {...formik.getFieldProps("totalClasses")}
          placeholder="Number of classes"
          id="totalClasses"
          className="w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
        />
        {formik.touched.totalClasses && formik.errors.totalClasses && (
          <p className="text-red-500 text-xs italic">{formik.errors.totalClasses}</p>
        )}
      </div>

      {/* Attended Classes */}
      <div className="flex flex-col">
        <label htmlFor="attendedClasses" className="text-gray-700 font-medium">
          <SiDatabricks className="inline mr-2 text-blue-500" />
          Attended Classes
        </label>
        <input
          type="number"
          {...formik.getFieldProps("attendedClasses")}
          placeholder="Number of Attended Classes"
          id="attendedClasses"
          className="w-full mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 py-2 px-3"
        />
        {formik.touched.attendedClasses && formik.errors.attendedClasses && (
          <p className="text-red-500 text-xs italic">{formik.errors.attendedClasses}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 transform"
      >
        Add Subject
      </button>
    </form>
  );
};

export default AddSubject;
