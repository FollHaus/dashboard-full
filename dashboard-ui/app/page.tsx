'use client'
import Layout from "@/ui/Layout";
import React, { useEffect } from "react";
import type { Metadata } from "next";
import DashboardControls from "@/components/dashboard/DashboardControls";
import KpiCards from "@/components/dashboard/KpiCards";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProducts from "@/components/dashboard/TopProducts";
import WeeklyTasks from "@/components/dashboard/WeeklyTasks";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import { usePeriod } from "@/store/period";

const metadata: Metadata = {
  title: "Главная",
};

export default function Home() {
  const { initFrom } = usePeriod();
  useEffect(() => {
    initFrom();
  }, [initFrom]);

  return (
    <Layout>
      <div className="flex justify-end mb-4">
        <DashboardControls />
      </div>
      <div className="grid gap-4">
        <KpiCards />
        <FinancialSummary />
        <SalesChart />
        <TopProducts />
        <WeeklyTasks />
      </div>
    </Layout>
  );
}
