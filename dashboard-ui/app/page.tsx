import Layout from "@/ui/Layout";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Главная",
};


export default function Home() {
    return (
        <Layout>
            <h1>
                Главная
            </h1>
        </Layout>
    );
}
