"use client";

import { motion } from "framer-motion";
import { Users, School, BarChart3, Settings } from "lucide-react";
import Card from "./components/Card"; // assuming Card lives here

export default function SuperAdminDashboardPage() {
  const stats = [
    {
      title: "Total Users",
      value: "1,245",
      icon: Users,
      color: "bg-accentTeal",
    },
    { title: "Schools", value: "32", icon: School, color: "bg-accentPurple" },
    {
      title: "Active Sessions",
      value: "87",
      icon: BarChart3,
      color: "bg-accentPink",
    },
    {
      title: "Settings",
      value: "Manage",
      icon: Settings,
      color: "bg-accentYellow",
    },
  ];

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 text-lightGrey">
        SuperAdmin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <div className="flex items-center justify-between p-4">
                <div>
                  <h2 className="text-lg font-semibold">{stat.title}</h2>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div
                  className={`${stat.color} p-3 rounded-full shadow-md transition-transform transform hover:scale-110`}
                >
                  <stat.icon className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
