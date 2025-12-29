import React, { useState, useEffect, useMemo } from 'react';
import { DatePicker } from 'antd-mobile';
import { DownOutline } from 'antd-mobile-icons';
// Fix import for some environments
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { useLedgerStore } from '../../store/useLedgerStore';
import { TransactionType } from '../../types/transaction';
import { CATEGORY_ICONS } from '../../utils/constants';

// --- Types ---
interface ChartDataPoint {
    date: string;
    value: number;
}
interface CategoryStat {
    id: string;
    name: string;
    value: number;
    percent: number;
    icon: string;
}

const StatisticsPage: React.FC = () => {
    // --- Store & State ---
    const { currentLedger, fetchLedgers } = useLedgerStore();
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [pickerVisible, setPickerVisible] = useState(false);
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);

    // Mock Data States
    const [trendData, setTrendData] = useState<ChartDataPoint[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryStat[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);

    const isExpense = type === TransactionType.EXPENSE;
    const themeColor = isExpense ? '#ff4d4f' : '#52c41a';

    // --- Initial Fetch ---
    useEffect(() => {
        fetchLedgers();
    }, []);

    // --- Data Logic ---
    useEffect(() => {
        if (!currentLedger) return;

        // Mock Fetch Logic
        const daysInMonth = dayjs(currentDate).daysInMonth();
        const mockTrend: ChartDataPoint[] = [];
        for (let i = 1; i <= daysInMonth; i++) {
            mockTrend.push({
                date: `${i}日`,
                value: Math.floor(Math.random() * (isExpense ? 500 : 800))
            });
        }
        setTrendData(mockTrend);

        // Mock Categories
        const categoriesPool = Object.keys(CATEGORY_ICONS);
        const mockCategories: CategoryStat[] = categoriesPool.map(key => ({
            id: key,
            name: CATEGORY_ICONS[key].label,
            value: Math.floor(Math.random() * 2000) + 100,
            percent: 0,
            icon: CATEGORY_ICONS[key].icon
        })).sort((a, b) => b.value - a.value).slice(0, 5);

        const total = mockCategories.reduce((sum, item) => sum + item.value, 0);
        setTotalAmount(total);
        setCategoryData(mockCategories.map(c => ({ ...c, percent: total > 0 ? (c.value / total) * 100 : 0 })));

    }, [currentLedger, currentDate, type]);

    // --- Chart Options ---
    const lineOption = useMemo(() => {
        if (!echarts) return {};
        return {
            grid: { top: 30, right: 10, bottom: 20, left: 10, containLabel: true },
            tooltip: {
                trigger: 'axis',
                formatter: '{b}: ¥{c}'
            },
            xAxis: {
                type: 'category',
                data: trendData.map(d => d.date),
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: '#999', fontSize: 10, interval: 4 }
            },
            yAxis: {
                type: 'value',
                splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
                axisLabel: { color: '#999', fontSize: 10 }
            },
            series: [{
                data: trendData.map(d => d.value),
                type: 'line',
                smooth: true,
                symbol: 'none',
                lineStyle: { color: themeColor, width: 2.5 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: themeColor },
                        { offset: 1, color: 'rgba(255, 255, 255, 0)' }
                    ]),
                    opacity: 0.15
                }
            }]
        };
    }, [trendData, themeColor]);

    const pieOption = useMemo(() => {
        return {
            tooltip: { trigger: 'item' },
            legend: { bottom: 0, icon: 'circle', itemGap: 10 },
            series: [
                {
                    name: '占比',
                    type: 'pie',
                    radius: ['40%', '65%'],
                    center: ['50%', '42%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 8,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: { show: false },
                    data: categoryData.map(d => ({ value: d.value, name: d.name }))
                }
            ]
        };
    }, [categoryData]);

    // Loading State
    if (!currentLedger) {
        return <div className="p-10 text-center text-gray-400">Loading Ledger Config...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 font-sans selection:bg-gray-200">
            {/* Header */}
            <div className="bg-white px-4 pb-4 pt-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-10">
                <div className="flex justify-between items-center mb-6">
                    <div
                        className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full cursor-pointer active:bg-gray-100"
                        onClick={() => setPickerVisible(true)}
                    >
                        <span className="font-bold text-gray-800 text-sm">
                            {dayjs(currentDate).format('YYYY年MM月')}
                        </span>
                        <DownOutline fontSize={12} className="text-gray-400" />
                    </div>

                    <div className="flex bg-gray-100 p-0.5 rounded-lg">
                        <button
                            className={classNames(
                                "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                                isExpense ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-600"
                            )}
                            onClick={() => setType(TransactionType.EXPENSE)}
                        >支出</button>
                        <button
                            className={classNames(
                                "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                                !isExpense ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-600"
                            )}
                            onClick={() => setType(TransactionType.INCOME)}
                        >收入</button>
                    </div>
                </div>

                <div className="text-center pb-2">
                    <div className="text-gray-400 text-xs mb-1 tracking-wide">
                        {isExpense ? '本月总支出' : '本月总收入'}
                    </div>
                    <div className="flex justify-center items-baseline">
                        <span className="text-xl font-bold mr-1 text-gray-400">¥</span>
                        <span className={classNames("text-4xl font-black font-mono tracking-tighter", isExpense ? 'text-gray-900' : 'text-green-600')}>
                            {(totalAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 hide-scrollbar">

                {/* Charts */}
                <div className="grid gap-4">
                    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
                        <h3 className="text-xs font-bold text-gray-900 mb-4 border-l-4 border-gray-900 pl-2">趋势分析</h3>
                        <div className="h-56 w-full">
                            <ReactECharts option={lineOption} style={{ height: '100%', width: '100%' }} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
                        <h3 className="text-xs font-bold text-gray-900 mb-4 border-l-4 border-gray-900 pl-2">分类构成</h3>
                        <div className="h-56 w-full">
                            <ReactECharts option={pieOption} style={{ height: '100%', width: '100%' }} />
                        </div>
                    </div>
                </div>

                {/* Ranking */}
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
                    <h3 className="text-xs font-bold text-gray-900 mb-4 border-l-4 border-gray-900 pl-2">
                        排行榜 (Top 5)
                    </h3>
                    <div className="space-y-4">
                        {categoryData.length === 0 && <div className="text-center text-gray-300 py-6 text-xs">暂无数据</div>}
                        {categoryData.map((item, index) => (
                            <div key={item.id} className="group">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-base">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-700">{item.name}</div>
                                            <div className="text-[10px] text-gray-400">{item.percent.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                    <div className="font-mono text-sm font-bold text-gray-900">
                                        {item.value / 100}
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: `${item.percent}%`,
                                            backgroundColor: themeColor
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <DatePicker
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                precision="month"
                value={currentDate}
                onConfirm={val => {
                    setCurrentDate(val);
                    setPickerVisible(false);
                }}
                max={new Date()}
            />
        </div>
    );
};

export default StatisticsPage;
