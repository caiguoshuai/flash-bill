import React, { useState, useEffect } from 'react';
import { NavBar } from 'antd-mobile';
import { CATEGORY_ICONS } from '../../utils/constants';

const StatisticsPage: React.FC = () => {
    // Mock Stats Data
    const stats = [
        { category: 'food', amount: 125000, percent: 45 },
        { category: 'transport', amount: 45000, percent: 16 },
        { category: 'shopping', amount: 68000, percent: 24 },
        { category: 'housing', amount: 30000, percent: 10 },
        { category: 'entertainment', amount: 12000, percent: 5 },
    ];

    const formatCurrency = (amount: number) => (amount / 100).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
            <div className="bg-white px-4 border-b border-gray-100">
                <NavBar back={null}>收支统计</NavBar>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {/* Chart Placeholder / Summary */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 text-center">
                    <div className="text-gray-500 mb-2">本月总支出</div>
                    <div className="text-4xl font-bold font-mono">¥2,800.00</div>
                    <div className="mt-6 flex justify-center opacity-50">
                        {/* Visual Placeholder for a Pie Chart */}
                        <div className="w-32 h-32 rounded-full border-8 border-primary border-t-transparent animate-spin-slow" style={{ animationDuration: '3s' }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Demo: 数据可视化模块正在开发中</p>
                </div>

                {/* Ranking List */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="font-bold mb-4 text-gray-800">支出排行榜</div>
                    {stats.map((item, index) => {
                        const cat = CATEGORY_ICONS[item.category];
                        return (
                            <div key={item.category} className="mb-4 last:mb-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center">
                                        <span className="mr-2 text-lg">{cat?.icon}</span>
                                        <span className="text-sm font-medium">{cat?.label}</span>
                                        <span className="text-xs text-gray-400 ml-2">{item.percent}%</span>
                                    </div>
                                    <div className="font-mono font-medium">¥{formatCurrency(item.amount)}</div>
                                </div>
                                {/* Progress Bar */}
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full opacity-80"
                                        style={{ width: `${item.percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StatisticsPage;
