import React from "react";

const Metrics = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-100 p-4 rounded-card shadow-card">
                <h3 className="text-lg font-semibold mb-2">Оборот</h3>
                <p className="text-2xl font-bold">1 500 000 ₽</p>
                <p className="text-sm text-neutral-700 mt-1">За неделю: 350 000 ₽</p>
            </div>
            <div className="bg-neutral-100 p-4 rounded-card shadow-card">
                <h3 className="text-lg font-semibold mb-2">Заказы</h3>
                <p className="text-2xl font-bold">32 сегодня</p>
                <p className="text-sm text-neutral-700 mt-1">За неделю: 210</p>
            </div>
            <div className="bg-neutral-100 p-4 rounded-card shadow-card">
                <h3 className="text-lg font-semibold mb-2">Товары на складе</h3>
                <p className="text-2xl font-bold">1 200 шт.</p>
            </div>
            <div className="bg-neutral-100 p-4 rounded-card shadow-card">
                <h3 className="text-lg font-semibold mb-2">Открытые задачи</h3>
                <p className="text-2xl font-bold">8</p>
            </div>
        </div>
    );
};

export default Metrics;
