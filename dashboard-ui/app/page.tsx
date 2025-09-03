'use client'
import Layout from "@/ui/Layout";
import React, { useEffect } from "react";
import type { Metadata } from "next";
import Statistics from "@/components/dashboard/Statistics";
import SalesChart from "@/components/dashboard/SalesChart";
import TopAnalytics from "@/components/dashboard/TopAnalytics";
import WeeklyTasks from "@/components/dashboard/WeeklyTasks";
import { useDashboardFilter } from "@/store/dashboardFilter";

const metadata: Metadata = {
  title: "Главная",
};

export default function Home() {
  const { initFrom } = useDashboardFilter();
  useEffect(() => {
    initFrom();
  }, [initFrom]);

  return (
    <Layout>
      <div>
        <Statistics />
        <SalesChart />
        <TopAnalytics />
        <WeeklyTasks />
      </div>
    </Layout>
  );
}
