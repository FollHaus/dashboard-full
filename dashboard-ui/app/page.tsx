'use client'
import Layout from "@/ui/Layout";
import React, { useState } from "react";
import type { Metadata } from "next";
import DashboardControls, { Period } from "@/components/dashboard/DashboardControls";
import KpiCards from "@/components/dashboard/KpiCards";
import SalesChart from "@/components/dashboard/SalesChart";
import InventorySnapshot from "@/components/dashboard/InventorySnapshot";
import TopProducts from "@/components/dashboard/TopProducts";
import WeeklyTasks from "@/components/dashboard/WeeklyTasks";

const metadata: Metadata = {
  title: "Главная",
};

export default function Home() {
  const [period, setPeriod] = useState<Period>("day");

  return (
    <Layout>
      <div className="flex justify-end mb-4">
        <DashboardControls period={period} onPeriodChange={setPeriod} />
      </div>
      <div className="space-y-8">
        <KpiCards period={period} />
        <SalesChart period={period} />
        <TopProducts period={period} />
        <InventorySnapshot />
        <WeeklyTasks />
      </div>
    </Layout>
  );
}
