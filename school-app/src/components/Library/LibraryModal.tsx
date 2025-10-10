"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Library } from "@/types/library";

type LibraryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (library: Library) => void;
  libraryToEdit?: Library;
};

export default function LibraryModal({
  isOpen,
  onClose,
  onSuccess,
  libraryToEdit,
}: LibraryModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (libraryToEdit) {
      setName(libraryToEdit.name);
      setCategory(libraryToEdit.category);
      setQuantity(libraryToEdit.quantity);
      setLocation(libraryToEdit.location);
    } else {
      setName("");
      setCategory("");
      setQuantity(0);
      setLocation("");
    }
  }, [libraryToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { name, category, quantity, location };
      let res;

      if (libraryToEdit?.id) {
        res = await axios.put(`/api/library?id=${libraryToEdit.id}`, payload);
      } else {
        res = await axios.post("/api/library", payload);
      }

      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save library record");
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
          {libraryToEdit ? "Edit Library Record" : "Add Library Record"}
        </h2>

        <label className="block text-lightGray mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Category</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full p-2 mb-3 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
        />

        <label className="block text-lightGray mb-1">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-secondary text-lightGray focus:outline-none focus:ring-2 focus:ring-accentPurple"
          required
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
