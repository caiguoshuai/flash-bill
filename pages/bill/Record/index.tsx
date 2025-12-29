import React, { useState, useMemo } from 'react';
import {
  NavBar,
  DatePicker,
  TextArea,
  NumberKeyboard,
  Toast,
} from 'antd-mobile';
import {
  CalendarOutline,
  EditSOutline,
  PayCircleOutline,
} from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useLedgerStore } from '../../../store/useLedgerStore';
import { createTransaction } from '../../../services/bill';
import { TransactionType } from '../../../types/transaction';
import classNames from 'classnames';

const RecordPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLedger } = useLedgerStore();

  // --- State ---
  const [activeType, setActiveType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [note, setNote] = useState<string>('');
  const [keyboardVisible, setKeyboardVisible] = useState(true);

  // Mock Category & Account Selection
  const [categoryId, setCategoryId] = useState<string>('food');
  const [accountId, setAccountId] = useState<string>('cash');

  // --- Handlers ---
  const handleInputAmount = (value: string) => {
    if (value === '.' && amount.includes('.')) return;
    if (amount.includes('.') && amount.split('.')[1].length >= 2) return;
    if (amount.length > 9) return;
    setAmount(prev => prev + value);
  };

  const handleDeleteAmount = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({ content: '请输入金额', position: 'top' });
      return;
    }

    if (!currentLedger) {
      Toast.show({ content: '未选择账本', icon: 'fail' });
      return;
    }

    const numericAmount = parseFloat(amount);
    const amountInCents = Math.round(numericAmount * 100);

    const payload = {
      uuid: uuidv4(),
      ledgerId: currentLedger.id, // Use actual ledger ID
      accountId: accountId,
      categoryId: categoryId,
      type: activeType,
      amount: amountInCents,
      date: dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ'),
      note: note.trim(),
    };

    try {
      // Mock delay for feeling
      await createTransaction(payload);
      Toast.show({ icon: 'success', content: '已保存' });

      // Reset
      setAmount('');
      setNote('');
      navigate('/home');
    } catch (error) {
      console.error(error);
      Toast.show({ icon: 'fail', content: '保存失败' });
    }
  };

  const categories = [
    { label: '餐饮', value: 'food', icon: '🍔' },
    { label: '交通', value: 'transport', icon: '🚗' },
    { label: '购物', value: 'shopping', icon: '🛍️' },
    { label: '娱乐', value: 'entertainment', icon: '🎮' },
    { label: '居住', value: 'housing', icon: '🏠' },
    { label: '医疗', value: 'medical', icon: '💊' },
    { label: '工资', value: 'salary', icon: '💰' },
    { label: '理财', value: 'investment', icon: '�' },
  ];

  const displayAmount = useMemo(() => {
    if (!amount) return '0.00';
    return amount;
  }, [amount]);

  const isExpense = activeType === TransactionType.EXPENSE;
  // Professional Fintech Colors: Expense = Red (#ff4d4f), Income = Green (#52c41a)
  const themeColor = isExpense ? 'text-red-500' : 'text-green-500';
  const themeBg = isExpense ? 'bg-red-50' : 'bg-green-50';
  const themeBorder = isExpense ? 'border-red-100' : 'border-green-100';

  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans selection:bg-blue-100">
      {/* 1. Minimalist Header */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <div
          onClick={() => navigate('/home')}
          className="p-2 -ml-2 text-gray-600 active:opacity-60 cursor-pointer"
        >
          <span className="text-sm font-medium">取消</span>
        </div>

        {/* Segmented Control */}
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button
            className={classNames(
              "px-6 py-1.5 rounded-md text-sm font-bold transition-all duration-300",
              isExpense ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setActiveType(TransactionType.EXPENSE)}
          >
            支出
          </button>
          <button
            className={classNames(
              "px-6 py-1.5 rounded-md text-sm font-bold transition-all duration-300",
              !isExpense ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setActiveType(TransactionType.INCOME)}
          >
            收入
          </button>
        </div>

        <div className="w-8"></div> {/* Spacer for center alignment */}
      </div>

      <div className="flex-1 overflow-y-auto pb-64 px-4 pt-4 hide-scrollbar">

        {/* 2. Amount Display (Clean & Huge) */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-4 text-center cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => setKeyboardVisible(true)}
        >
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
            {isExpense ? 'Expense Amount' : 'Income Amount'}
          </div>
          <div className="flex items-baseline justify-center">
            <span className={classNames("text-3xl font-bold mr-2 align-top opacity-80", themeColor)}>¥</span>
            <span className={classNames("text-6xl font-black tracking-tighter", themeColor)}>
              {displayAmount}
            </span>
            <span className={classNames("w-0.5 h-10 ml-1 animate-pulse", isExpense ? "bg-red-400" : "bg-green-400")}></span>
          </div>
        </div>

        {/* 3. Category Grid (Chips Style) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">分类</h3>
            <span className="text-xs text-gray-400">全部 &gt;</span>
          </div>
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
            {categories.map(cat => {
              const isSelected = categoryId === cat.value;
              return (
                <div
                  key={cat.value}
                  onClick={() => setCategoryId(cat.value)}
                  className={classNames(
                    "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer border",
                    isSelected
                      ? classNames(themeBg, themeBorder, isExpense ? "text-red-600" : "text-green-600", "font-bold scale-105")
                      : "bg-transparent border-transparent text-gray-400 hover:bg-gray-50"
                  )}
                >
                  <div className="text-2xl mb-1 filter drop-shadow-sm">{cat.icon}</div>
                  <div className="text-[11px]">{cat.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Details List (Clean Vertical List) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">

          {/* Date */}
          <div
            className="flex items-center p-4 border-b border-gray-50 active:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => setDatePickerVisible(true)}
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-3">
              <CalendarOutline />
            </div>
            <div className="flex-1 font-medium text-gray-700">日期</div>
            <div className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-md text-sm">
              {dayjs(date).format('YY年M月D日')}
            </div>
          </div>

          {/* Account */}
          <div className="flex items-center p-4 border-b border-gray-50">
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mr-3">
              <PayCircleOutline />
            </div>
            <div className="flex-1 font-medium text-gray-700">账户</div>
            <div className="flex gap-2">
              {['cash', 'bank'].map(acc => (
                <button
                  key={acc}
                  onClick={() => setAccountId(acc)}
                  className={classNames(
                    "px-3 py-1 rounded-md text-xs font-bold transition-all border",
                    accountId === acc
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  )}
                >
                  {acc === 'cash' ? '现金' : '银行'}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="flex items-start p-4">
            <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mr-3 pt-0.5">
              <EditSOutline />
            </div>
            <div className="flex-1">
              <TextArea
                placeholder="添加备注..."
                value={note}
                onChange={setNote}
                autoSize={{ minRows: 1, maxRows: 3 }}
                maxLength={100}
                className="text-base font-medium text-gray-900 w-full p-0 leading-relaxed"
                style={{ '--font-size': '15px' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Styled Keyboard */}
      {/* We overlay a custom style class to change the confirm button color dynamically */}
      <style>{`
        .custom-keyboard .adm-number-keyboard-sidebar-confirm {
          background-color: ${isExpense ? '#ff4d4f' : '#52c41a'} !important;
          border-radius: 8px !important;
          margin: 4px !important;
          height: calc(100% - 8px) !important; 
          font-weight: bold !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        .adm-number-keyboard-wrapper {
          background-color: #f9fafb !important;
          border-top: 1px solid #f3f4f6 !important;
        }
        .adm-number-keyboard-item {
          border-radius: 8px !important;
          margin: 4px !important;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
          background-color: white !important;
        }
        .adm-number-keyboard-item:active {
          background-color: #f3f4f6 !important;
        }
      `}</style>

      <NumberKeyboard
        visible={keyboardVisible}
        onClose={() => { }}
        onInput={handleInputAmount}
        onDelete={handleDeleteAmount}
        onConfirm={handleSave}
        customKey="."
        confirmText="完成"
        showCloseButton={false}
        className="custom-keyboard"
        safeArea
      />

      <DatePicker
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        value={date}
        onConfirm={v => setDate(v)}
        max={new Date()}
      />
    </div>
  );
};

export default RecordPage;