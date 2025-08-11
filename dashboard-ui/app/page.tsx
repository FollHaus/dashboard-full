import Layout from "@/ui/Layout";
import React from "react";
import type { Metadata } from "next";
import Metrics from "@/components/home/Metrics";
import SalesChart from "@/components/home/SalesChart";
import Notifications from "@/components/home/Notifications";
import TopProducts from "@/components/home/TopProducts";
import TaskList from "@/components/home/TaskList";

export const metadata: Metadata = {
  title: "Главная",
};


export default function Home() {
    return (
        <Layout>
            <div className="space-y-8">
                <Metrics/>
                <SalesChart/>
                <TopProducts/>
                <TaskList/>
                <Notifications/>
            </div>
        </Layout>
    );
}
