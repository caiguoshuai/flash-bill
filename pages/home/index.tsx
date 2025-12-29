import React, { useState, useEffect, useMemo } from 'react';
import { NavBar } from 'antd-mobile';
import { SearchOutline, CalendarOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { Transaction, TransactionType } from '../../types/transaction';
import { CATEGORY_ICONS } from '../../utils/constants';
import classNames from 'classnames';

dayjs.locale('zh-cn');

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<Transaction[]>([]);

    // Mock Data (will be replaced if API works)
    const loadMockData = () => {
        const mocks: Transaction[] = Array.from({ length: 15 }).map((_, i) => ({
            uuid: `mock-${i}`,
            ledgerId: '1',
            accountId: 'cash',
            categoryId: Object.keys(CATEGORY_ICONS)[i % 6],
            type: i % 3 === 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
            amount: Math.floor(Math.random() * 5000) + 100, // cents
            date: dayjs().subtract(i % 5, 'day').toISOString(),
            note: i % 4 === 0 ? '这是一个备注' : '',
        }));
        setList(mocks);
    };

    useEffect(() => {
        loadMockData(); // Initial load
    }, []);

    // Group by Date
    const groupedList = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};
        list.forEach(item => {
            const dateKey = dayjs(item.date).format('YYYY-MM-DD');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(item);
        });
        return Object.entries(groups).sort((a, b) => dayjs(b[0]).valueOf() - dayjs(a[0]).valueOf());
    }, [list]);

    // Statistics
    const summary = useMemo(() => {
        let income = 0;
        let expense = 0;
        list.forEach(t => {
            if (t.type === TransactionType.INCOME) income += t.amount;
            else expense += t.amount;
        });
        return { income, expense };
    }, [list]);

    const formatCurrency = (amount: number) => (amount / 100).toFixed(2);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 1. Header Area with Summary Card */}
            <div className="bg-primary pb-16 pt-safe">
                <div className="px-4 py-3 flex justify-between items-center text-white">
                    <div className="flex items-center gap-1 font-bold text-lg">
                        <span>Flash Bill</span>
                    </div>
                    <div className="flex gap-4 text-xl">
                        <SearchOutline />
                        <CalendarOutline />
                    </div>
                </div>

                {/* Monthly Summary */}
                <div className="px-6 py-4 text-white">
                    <div className="text-sm opacity-80 mb-1">本月支出 (元)</div>
                    <div className="text-4xl font-bold font-mono mb-4">
                        {formatCurrency(summary.expense)}
                    </div>
                    <div className="flex gap-8">
                        <div>
                            <div className="text-xs opacity-70 mb-1">本月收入</div>
                            <div className="font-mono text-lg">{formatCurrency(summary.income)}</div>
                        </div>
                        <div>
                            <div className="text-xs opacity-70 mb-1">结余</div>
                            <div className="font-mono text-lg">{formatCurrency(summary.income - summary.expense)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Transaction List */}
            <div className="-mt-10 px-3 relative z-10">
                {groupedList.map(([date, items]) => (
                    <div key={date} className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden">
                        {/* Date Header */}
                        <div className="px-4 py-2 bg-gray-50 flex justify-between items-center text-xs text-gray-500 border-b border-gray-100">
                            <span>{dayjs(date).format('MM月DD日 dddd')}</span>
                            {/* Daily total could go here */}
                        </div>

                        {/* Items */}
                        <div>
                            {items.map(item => {
                                const cat = CATEGORY_ICONS[item.categoryId] || { label: '未知', icon: '❓' };
                                const isExpense = item.type === TransactionType.EXPENSE;
                                return (
                                    <div key={item.uuid} className="flex items-center px-4 py-3 active:bg-gray-50 transition-colors">
                                        {/* Icon */}
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl mr-3 flex-shrink-0">
                                            {cat.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 mr-2">
                                            <div className="font-bold text-gray-900 truncate">
                                                {cat.label}
                                                {item.note && <span className="text-gray-400 font-normal text-xs ml-2">-{item.note}</span>}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {dayjs(item.date).format('HH:mm')} · {item.accountId === 'cash' ? '现金' : '银行卡'}
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className={classNames("font-mono font-medium text-lg whitespace-nowrap",
                                            isExpense ? "text-gray-900" : "text-green-500"
                                        )}>
                                            {isExpense ? '-' : '+'}{formatCurrency(item.amount)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="h-4"></div>
            </div>
        </div>
    );
};

export default HomePage;
