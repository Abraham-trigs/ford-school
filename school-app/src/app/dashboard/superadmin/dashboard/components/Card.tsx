// app/dashboard/superadmin/components/Card.tsx
"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  title?: string;
  value?: string | number;
  color?: string; // tailwind class like bg-deepPurple
  children?: ReactNode;
}

export default function Card({
  title,
  value,
  color = "",
  children,
}: CardProps) {
  return (
    <>
      <div className="transition-all duration-300 ">
        <div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative${color} text-secondary `}
          >
            {/* Default Title/Value Layout */}
            {(title || value) && (
              <div className="mb-2">
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                {value && <p className="text-2xl font-bold">{value}</p>}
              </div>
            )}

            {/* Allow custom content */}
            {children}
          </motion.div>
        </div>
      </div>
    </>
  );
}
