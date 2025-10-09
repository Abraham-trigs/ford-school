"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Teacher } from "@/types/teacher";

type TeacherModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (teacher: Teacher) => void;
  teacherToEdit?: Teacher;
};

export default function TeacherModal({
  isOpen,
  onClose,
  onSuccess,
  teacherToEdit,
}: TeacherModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"TEACHER" | "HEAD_TEACHER" | "ADMIN">(
    "TEACHER"
  );
  const [subjects, setSubjects] = useState<string>("");
  const [classes, setClasses] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacherToEdit) {
      setFirstName(teacherToEdit.firstName);
      setLastName(teacherToEdit.lastName);
      setEmail(teacherToEdit.email);
      setPhone(teacherToEdit.phone || "");
      setRole(teacherToEdit.role || "TEACHER");
      setSubjects(teacherToEdit.subjects.join(", "));
      setClasses(teacherToEdit.classes.join(", "));
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setRole("TEACHER");
      setSubjects("");
      setClasses("");
    }
  }, [teacherToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: Teacher = {
      firstName,
      lastName,
      email,
      phone,
      role,
      subjects: subjects.split(",").map((s) => s.trim()),
      classes: classes.split(",").map((c) => c.trim()),
      id: teacherToEdit?.id,
    };

    try {
      let res;
      if (teacherToEdit?.id) {
        res = await axios.put(`/api/teachers?id=${teacherToEdit.id}`, payload);
      } else {
        res = await axios.post("/api/teachers", payload);
      }
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save teacher");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
    >
      <motion.form
        onSubmit={handleSubmit}
        className="bg-deepest0 p-6 rounded-lg w-full max-w-md shadow-lg"
      >
        <h2 className="text-xl font-display text-lightGray mb-4">
          {teacherToEdit ? "Edit Teacher" : "Add Teacher"}
        </h2>

        <label className="block text-lightGray mb-1">First Name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Last Name</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Phone</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
        />

        <label className="block text-lightGray mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
        >
          <option value="TEACHER">Teacher</option>
          <option value="HEAD_TEACHER">Head Teacher</option>
          <option value="ADMIN">Admin</option>
        </select>

        <label className="block text-lightGray mb-1">
          Subjects (comma-separated)
        </label>
        <input
          type="text"
          value={subjects}
          onChange={(e) => setSubjects(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
        />

        <label className="block text-lightGray mb-1">
          Classes (comma-separated)
        </label>
        <input
          type="text"
          value={classes}
          onChange={(e) => setClasses(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
        />

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-secondary text-lightGray rounded hover:bg-deeper transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-accentPurple text-background rounded hover:bg-purple0 transition-colors"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.form>
    </motion.div>
  );
}
