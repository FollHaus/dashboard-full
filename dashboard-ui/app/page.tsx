import Layout from "@/ui/Layout";
import React, { useState } from "react";
import type { Metadata } from "next";
import DashboardControls, { Period } from "@/components/dashboard/DashboardControls";
import KpiCards from "@/components/dashboard/KpiCards";
import SalesChart from "@/components/dashboard/SalesChart";
import InventorySnapshot from "@/components/dashboard/InventorySnapshot";
import TopProducts from "@/components/dashboard/TopProducts";
import WeeklyTasks from "@/components/dashboard/WeeklyTasks";

export const metadata: Metadata = {
  title: "Главная",
};

export default function Home() {
  const [period, setPeriod] = useState<Period>("day");

  return (
    <Layout>
      <div className="space-y-8">
        <DashboardControls period={period} onPeriodChange={setPeriod} />
        <KpiCards period={period} />
        <SalesChart period={period} />
        <InventorySnapshot />
        <TopProducts />
        <WeeklyTasks />
      </div>
    </Layout>
  );
}
