import React, { useState, useMemo } from 'react';
import { NavBar, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import { createTransaction } from '../../../services/bill';
import { TransactionType } from '../../../types/transaction';

// --- Configuration ---
const CATEGORIES = {
  [TransactionType.EXPENSE]: [
    { id: 'food', name: '餐饮', icon: '🍜' },
    { id: 'shopping', name: '购物', icon: '🛍️' },
    { id: 'transport', name: '交通', icon: '🚕' },
    { id: 'home', name: '居住', icon: '🏠' },
    { id: 'entertainment', name: '娱乐', icon: '🎤' },
    { id: 'medical', name: '医疗', icon: '💊' },
    { id: 'study', name: '学习', icon: '📚' },
    { id: 'social', name: '人情', icon: '🧧' },
    { id: 'beauty', name: '美容', icon: '💄' },
    { id: 'digital', name: '数码', icon: '📱' },
  ],
  [TransactionType.INCOME]: [
    { id: 'salary', name: '工资', icon: '💳' },
    { id: 'bonus', name: '奖金', icon: '💰' },
    { id: 'investment', name: '理财', icon: '📈' },
    { id: 'part-time', name: '兼职', icon: '🔨' },
  ]
};

const RecordPage: React.FC = () => {
  const navigate = useNavigate();

  // --- State ---
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('food'); // Default to first
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState<string>('');

  // --- Helpers ---
  const currentCategories = CATEGORIES[type];
  const activeCategory = currentCategories.find(c => c.id === categoryId) || currentCategories[0];
  
  const themeColor = type === TransactionType.EXPENSE ? 'text-primary' : 'text-success';
  const bgColor = type === TransactionType.EXPENSE ? 'bg-primary' : 'bg-success';

  // --- Handlers ---
  const handleKeypadPress = (key: string) => {
    if (key === 'delete') {
      setAmount(prev => prev.slice(0, -1));
      return;
    }
    if (key === 'confirm') {
      handleSubmit();
      return;
    }
    if (key === 'date') {
      Toast.show('日期选择功能暂未集成 (Mock)');
      return;
    }
    
    // Number logic
    if (amount.length > 9) return;
    if (key === '.' && amount.includes('.')) return;
    if (key === '.' && amount === '') {
      setAmount('0.');
      return;
    }
    // Limit decimal places
    if (amount.includes('.') && amount.split('.')[1].length >= 2) return;

    setAmount(prev => prev + key);
  };

  const handleSubmit = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      Toast.show('请输入金额');
      return;
    }

    const payload = {
      uuid: uuidv4(),
      ledgerId: 'default',
      accountId: 'cash',
      categoryId: categoryId || currentCategories[0].id,
      type,
      amount: Math.round(val * 100),
      date: dayjs(date).format(),
      note
    };

    console.log('Submit:', payload);
    
    try {
      await createTransaction(payload);
      Toast.show({ icon: 'success', content: '记账成功' });
      navigate(-1);
    } catch (error) {
       // handled by request interceptor usually
       console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* 1. Header Area (White Background) */}
      <div className="bg-white pb-2 flex-shrink-0">
        <NavBar onBack={() => navigate(-1)}>
          <div className="flex justify-center w-full pr-8">
            <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
               <div 
                 className={classNames("px-4 py-1 rounded-md transition-all", type === TransactionType.EXPENSE ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}
                 onClick={() => { setType(TransactionType.EXPENSE); setCategoryId(CATEGORIES[TransactionType.EXPENSE][0].id); }}
               >
                 支出
               </div>
               <div 
                 className={classNames("px-4 py-1 rounded-md transition-all", type === TransactionType.INCOME ? "bg-white shadow-sm text-gray-900" : "text-gray-500")}
                 onClick={() => { setType(TransactionType.INCOME); setCategoryId(CATEGORIES[TransactionType.INCOME][0].id); }}
               >
                 收入
               </div>
            </div>
          </div>
        </NavBar>

        {/* Amount Display & Selected Category Icon */}
        <div className="px-6 py-4 flex items-end justify-between">
           <div className="flex items-center space-x-3">
              <div className={classNames("w-10 h-10 rounded-full flex items-center justify-center text-xl text-white", bgColor)}>
                 {activeCategory.icon}
              </div>
              <span className="font-bold text-gray-700">{activeCategory.name}</span>
           </div>
           <div className="flex items-baseline">
             <span className="text-2xl font-bold text-gray-800 mr-1">¥</span>
             <span className="text-5xl font-mono font-bold text-gray-900">{amount || '0.00'}</span>
           </div>
        </div>
      </div>

      {/* 2. Category Grid Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4">
         <div className="grid grid-cols-5 gap-y-6">
            {currentCategories.map(cat => (
              <div 
                key={cat.id} 
                className="flex flex-col items-center gap-1"
                onClick={() => setCategoryId(cat.id)}
              >
                <div className={classNames(
                  "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all",
                  categoryId === cat.id ? "bg-gray-200 scale-110" : "bg-gray-100 text-gray-500 opacity-70"
                )}>
                  {cat.icon}
                </div>
                <span className={classNames("text-xs", categoryId === cat.id ? "font-bold text-gray-800" : "text-gray-400")}>
                  {cat.name}
                </span>
              </div>
            ))}
         </div>
      </div>

      {/* 3. Embedded Custom Keypad (Fixed Bottom) */}
      <div className="bg-white safe-area-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
        
        {/* Helper Bar: Note & Date */}
        <div className="flex items-center px-4 py-2 border-b border-gray-100 text-sm">
           <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 mr-3 text-gray-600" onClick={() => Toast.show('Mock: Note Input')}>
              <span className="mr-1">📝</span>
              <span className="truncate max-w-[150px]">{note || '添加备注...'}</span>
           </div>
           <div className="flex items-center text-gray-500 ml-auto">
              {dayjs(date).format('MM月DD日')}
           </div>
        </div>

        {/* Grid Keypad */}
        <div className="grid grid-cols-4 grid-rows-4 h-64 border-t border-gray-100">
           {/* Numbers */}
           {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
             <button 
               key={num} 
               className="text-2xl font-medium text-gray-800 border-r border-b border-gray-100 active:bg-gray-100 transition-colors"
               onClick={() => handleKeypadPress(num)}
             >
               {num}
             </button>
           ))}
           
           {/* Zero Group */}
           <button className="text-2xl font-medium text-gray-800 border-r border-b border-gray-100 active:bg-gray-100" onClick={() => handleKeypadPress('.')}>.</button>
           <button className="text-2xl font-medium text-gray-800 border-r border-b border-gray-100 active:bg-gray-100" onClick={() => handleKeypadPress('0')}>0</button>
           
           {/* Delete Key */}
           <button className="text-xl font-medium text-gray-800 border-r border-b border-gray-100 active:bg-gray-100 flex items-center justify-center" onClick={() => handleKeypadPress('delete')}>
              ⌫
           </button>

           {/* Right Column: Date & Confirm */}
           <div className="col-start-4 row-start-1 row-end-3 border-b border-gray-100">
              <button 
                className="w-full h-full text-lg text-gray-600 active:bg-gray-100 flex flex-col items-center justify-center gap-1"
                onClick={() => handleKeypadPress('date')}
              >
                <span className="text-xl">📅</span>
                <span className="text-xs">日期</span>
              </button>
           </div>
           <div className="col-start-4 row-start-3 row-end-5">
              <button 
                className={classNames(
                  "w-full h-full text-white text-lg font-bold transition-all active:opacity-90",
                  bgColor
                )}
                onClick={() => handleKeypadPress('confirm')}
              >
                完成
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RecordPage;