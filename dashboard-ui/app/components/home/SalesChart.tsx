import React from "react";

const data = [50, 75, 60, 90, 120, 80, 100];
const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const SalesChart = () => {
    const max = Math.max(...data);
    return (
        <div className="bg-neutral-100 p-4 rounded-card shadow-card">
            <h3 className="text-lg font-semibold mb-4">Продажи за неделю</h3>
            <div className="flex items-end space-x-2 h-40">
                {data.map((value, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1">
                        <div
                            className="bg-primary-500 w-full rounded-t"
                            style={{height: `${(value / max) * 100}%`}}
                        ></div>
                        <span className="mt-2 text-sm text-neutral-800">{labels[idx]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SalesChart;
