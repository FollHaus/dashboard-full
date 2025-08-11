"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/ui/Button/Button";

const QuickActions = () => {
    const router = useRouter();
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <Button className="w-full" onClick={() => router.push("/tasks/new")}>Добавить задачу</Button>
            <Button className="w-full" onClick={() => router.push("/reports/new")}>Создать отчёт</Button>
            <Button className="w-full" onClick={() => router.push("/products/receipt")}>Приход товара</Button>
        </div>
    );
};

export default QuickActions;
