import Layout from "@/ui/Layout";
import React from "react";
import {metadata} from "./layout";


metadata.title = "Главная";


export default function Home() {
    return (
        <Layout>
            <h1>
                Главная
            </h1>
        </Layout>
    );
}
