// app/dashboard/components/Card.tsx
"use client";

interface CardProps {
  title: string;
  value: string | number;
  color?: string; // optional, default will be deepPurple
}

export default function Card({
  title,
  value,
  color = "deepPurple",
}: CardProps) {
  return (
    <div className={`bg-${color} text-secondary rounded-lg p-6 shadow-md`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
