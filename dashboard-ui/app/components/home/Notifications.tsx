import React from "react";

const Notifications = () => {
    const items = [
        "Низкий баланс на счёте",
        "Важно: завершить отчёт по проекту",
        "Задержка поставки товара #123",
    ];
    return (
        <div className="bg-neutral-100 p-4 rounded-card shadow-card">
            <h3 className="text-lg font-semibold mb-4">Уведомления</h3>
            <ul className="space-y-2">
                {items.map((item, idx) => (
                    <li key={idx} className="border-l-4 border-warning pl-2 text-neutral-900">{item}</li>
                ))}
            </ul>
        </div>
    );
};

export default Notifications;
