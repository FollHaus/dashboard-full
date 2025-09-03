'use client'
import Layout from "@/ui/Layout";
import React, { useEffect } from "react";
import type { Metadata } from "next";
import Statistics from "@/components/dashboard/Statistics";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProducts from "@/components/dashboard/TopProducts";
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
      <div className="grid gap-6 md:gap-8">
        <Statistics />
        <SalesChart />
        <TopProducts />
        <WeeklyTasks />
      </div>
    </Layout>
  );
}
