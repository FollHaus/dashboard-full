import React from "react";
import Link from "next/link";
import Button from "@/ui/Button/Button";

const QuickActions = () => {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/tasks/new">
                <Button className="w-full">Добавить задачу</Button>
            </Link>
            <Link href="/reports/new">
                <Button className="w-full">Создать отчёт</Button>
            </Link>
            <Link href="/products/receipt">
                <Button className="w-full">Приход товара</Button>
            </Link>
        </div>
    );
};

export default QuickActions;
