import React, { useState, useEffect, useMemo } from 'react';
import { NavBar, SearchBar, DatePicker, Toast } from 'antd-mobile';
import { SearchOutline, CalendarOutline, UnorderedListOutline, CloseCircleOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { Transaction, TransactionType } from '../../types/transaction';
import { CATEGORY_ICONS } from '../../utils/constants';
import { useLedgerStore } from '../../store/useLedgerStore';
import LedgerSidebar from '../../components/LedgerSidebar';
import { getTransactionList } from '../../services/bill';
import classNames from 'classnames';

dayjs.locale('zh-cn');

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const [rawList, setRawList] = useState<Transaction[]>([]); // Renamed to rawList
    const [sidebarVisible, setSidebarVisible] = useState(false);

    // Feature: Search
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Feature: Calendar (Month Picker)
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const { currentLedger, fetchLedgers } = useLedgerStore();

    // Mock Data (will be replaced if API works)
    const loadMockData = (ledgerId: string) => {
        // In real app, pass ledgerId to API
        console.log("Fetching for ledger:", ledgerId);

        const mocks: Transaction[] = Array.from({ length: 30 }).map((_, i) => ({
            uuid: `mock-${i}-${ledgerId}`,
            ledgerId: ledgerId,
            accountId: 'cash',
            categoryId: Object.keys(CATEGORY_ICONS)[i % 6],
            type: i % 3 === 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
            amount: Math.floor(Math.random() * 5000) + 100, // cents
            date: dayjs().subtract(i % 10, 'day').toISOString(), // Generate data for last 10 days
            note: i % 4 === 0 ? '这是一个备注' : '',
        }));
        setRawList(mocks);
    };

    // Initial Fetch
    useEffect(() => {
        fetchLedgers();
    }, []);

    // React to ledger change
    useEffect(() => {
        if (currentLedger) {
            loadMockData(currentLedger.id);
            // TODO: getTransactionList({ ledgerId: currentLedger.id }).then(...)
        }
    }, [currentLedger]);

    // Filter Logic: Search Keyword + Selected Month
    const filteredList = useMemo(() => {
        return rawList.filter(item => {
            const itemDate = dayjs(item.date);
            const selectedMonth = dayjs(currentDate);

            // 1. Filter by Month
            const isSameMonth = itemDate.isSame(selectedMonth, 'month');
            if (!isSameMonth) return false;

            // 2. Filter by Search Keyword
            if (searchText) {
                const cat = CATEGORY_ICONS[item.categoryId];
                const catName = cat ? cat.label : '';
                const note = item.note || '';
                return catName.includes(searchText) || note.includes(searchText);
            }

            return true;
        });
    }, [rawList, currentDate, searchText]);

    // Group by Date (uses filteredList)
    const groupedList = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};
        filteredList.forEach(item => {
            const dateKey = dayjs(item.date).format('YYYY-MM-DD');
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(item);
        });
        return Object.entries(groups).sort((a, b) => dayjs(b[0]).valueOf() - dayjs(a[0]).valueOf());
    }, [filteredList]);

    // Statistics (uses filteredList - recalculates based on view)
    const summary = useMemo(() => {
        let income = 0;
        let expense = 0;
        filteredList.forEach(t => {
            if (t.type === TransactionType.INCOME) income += t.amount;
            else expense += t.amount;
        });
        return { income, expense };
    }, [filteredList]);

    const formatCurrency = (amount: number) => (amount / 100).toFixed(2);

    return (
        <div className="flex flex-col h-full bg-gray-50 pb-20">
            {/* 1. Header Area with Summary Card */}
            <div className="bg-primary pb-16 pt-safe transition-all">
                {/* Navbar / Search Bar Area */}
                <div className="px-4 py-3 flex justify-between items-center text-white min-h-[50px]">
                    {isSearchVisible ? (
                        <div className="flex-1 flex items-center gap-2 animate-fadeInLeft">
                            <SearchBar
                                placeholder="搜索分类或备注"
                                className="flex-1 bg-white/20 rounded-full text-white"
                                style={{ '--background': 'rgba(255,255,255,0.2)', '--text-color': '#fff', '--placeholder-color': 'rgba(255,255,255,0.7)' }}
                                value={searchText}
                                onChange={setSearchText}
                                onClear={() => setSearchText('')}
                                showCancelButton={false}
                            />
                            <div onClick={() => { setIsSearchVisible(false); setSearchText(''); }} className="text-sm opacity-80 cursor-pointer">
                                取消
                            </div>
                        </div>
                    ) : (
                        <>
                            <div
                                className="flex items-center gap-2 font-bold text-lg cursor-pointer active:opacity-80"
                                onClick={() => setSidebarVisible(true)}
                            >
                                <UnorderedListOutline fontSize={24} />
                                <span className="truncate max-w-[200px]">
                                    {currentLedger ? currentLedger.name : 'Loading...'}
                                </span>
                            </div>
                            <div className="flex gap-4 text-xl">
                                <SearchOutline onClick={() => setIsSearchVisible(true)} className="cursor-pointer hover:opacity-80" />
                                <CalendarOutline onClick={() => setIsDatePickerVisible(true)} className="cursor-pointer hover:opacity-80" />
                            </div>
                        </>
                    )}
                </div>

                {/* Monthly Summary (Context Aware Text) */}
                <div className="px-6 py-4 text-white">
                    <div className="flex items-center gap-2 mb-1 opacity-80">
                        <span className="text-sm">{dayjs(currentDate).format('YYYY年 MM月')}</span>
                        <div className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] cursor-pointer" onClick={() => setIsDatePickerVisible(true)}>切换</div>
                    </div>

                    <div className="text-sm opacity-80 mb-1">
                        {searchText ? '搜索结果支出' : '总支出'} (元)
                    </div>
                    <div className="text-4xl font-bold font-mono mb-4">
                        {formatCurrency(summary.expense)}
                    </div>
                    <div className="flex gap-8">
                        <div>
                            <div className="text-xs opacity-70 mb-1">{searchText ? '搜索结果收入' : '总收入'}</div>
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
            <div className="-mt-10 px-3 relative z-10 flex-1 overflow-y-auto hide-scrollbar">
                {groupedList.length > 0 ? (
                    groupedList.map(([date, items]) => (
                        <div key={date} className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden">
                            {/* Date Header */}
                            <div className="px-4 py-2 bg-gray-50 flex justify-between items-center text-xs text-gray-500 border-b border-gray-100">
                                <span>{dayjs(date).format('MM月DD日 dddd')}</span>
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
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                        <div className="text-4xl mb-2">🍃</div>
                        <div className="text-sm">本月没有账单哦</div>
                        {searchText && <div className="text-xs mt-1">换个关键词试试?</div>}
                    </div>
                )}

                <div className="h-10 text-center text-gray-300 text-xs py-4">
                    - Flash Bill -
                </div>
            </div>

            <DatePicker
                visible={isDatePickerVisible}
                onClose={() => setIsDatePickerVisible(false)}
                precision='month'
                title='选择月份'
                max={new Date()}
                onConfirm={val => {
                    setCurrentDate(val);
                }}
            />

            <LedgerSidebar
                visible={sidebarVisible}
                onClose={() => setSidebarVisible(false)}
            />
        </div>
    );
};

export default HomePage;

