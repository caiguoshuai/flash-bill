import React, { useState, useMemo } from 'react';
import { 
  NavBar, 
  Tabs, 
  DatePicker, 
  Input, 
  TextArea, 
  NumberKeyboard, 
  Button, 
  Toast,
  Form,
  Selector
} from 'antd-mobile';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { createTransaction } from '../../../services/bill';
import { TransactionType } from '../../../types/transaction';

// Icons using unicode/emoji for simplicity in this demo, real app would use SVG components
const ICONS = {
  back: '←',
  calendar: '📅',
};

const RecordPage: React.FC = () => {
  // --- State ---
  const [activeType, setActiveType] = useState<string>(String(TransactionType.EXPENSE));
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [note, setNote] = useState<string>('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Mock Category & Account Selection (In real app, fetch these from store/API)
  const [categoryId, setCategoryId] = useState<string>('food');
  const [accountId, setAccountId] = useState<string>('cash');

  // --- Handlers ---

  const handleInputAmount = (value: string) => {
    // Validate input (prevent multiple decimals, limit length)
    if (value === '.' && amount.includes('.')) return;
    if (amount.includes('.') && amount.split('.')[1].length >= 2) return; // Max 2 decimal places
    if (amount.length > 9) return; 

    setAmount(prev => prev + value);
  };

  const handleDeleteAmount = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show('请输入有效金额');
      return;
    }
    if (!categoryId) {
      Toast.show('请选择分类');
      return;
    }

    const numericAmount = parseFloat(amount);
    // Convert to cents (Int64 equivalent logic)
    // Using Math.round to avoid floating point errors (e.g. 4.12 * 100 = 412.00000000000006)
    const amountInCents = Math.round(numericAmount * 100);

    const payload = {
      uuid: uuidv4(), // Generate UUID frontend side
      ledgerId: 'default-ledger-id', // Assuming default ledger context
      accountId: accountId,
      categoryId: categoryId,
      type: parseInt(activeType) as TransactionType,
      amount: amountInCents,
      date: dayjs(date).format('YYYY-MM-DDTHH:mm:ssZ'), // ISO format
      note: note.trim(),
    };

    try {
      Toast.show({
        icon: 'loading',
        content: '保存中...',
        duration: 0,
      });

      await createTransaction(payload);
      
      Toast.clear();
      Toast.show({
        icon: 'success',
        content: '记账成功',
      });

      // Reset form
      setAmount('');
      setNote('');
      setKeyboardVisible(false);
      
    } catch (error) {
      console.error(error);
      // Error handling is largely done in request interceptor, 
      // but specific UI recovery can happen here.
      Toast.clear();
    }
  };

  // --- Render Helpers ---

  const displayAmount = useMemo(() => {
    if (!amount) return '0.00';
    return amount;
  }, [amount]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 1. Navigation Bar */}
      <NavBar onBack={() => console.log('back')} className="bg-white border-b border-gray-100">
        记一笔
      </NavBar>

      {/* 2. Type Tabs (Income/Expense) */}
      <div className="bg-white pt-2">
        <Tabs 
          activeKey={activeType} 
          onChange={setActiveType}
          style={{ '--title-font-size': '16px' }}
        >
          <Tabs.Tab title="支出" key={String(TransactionType.EXPENSE)} />
          <Tabs.Tab title="收入" key={String(TransactionType.INCOME)} />
        </Tabs>
      </div>

      {/* 3. Main Input Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        
        {/* Category Selector (Mocked) */}
        <div className="p-4 bg-white mb-2">
           <div className="text-sm text-gray-500 mb-2">选择分类</div>
           <Selector
              columns={3}
              options={[
                { label: '餐饮', value: 'food' },
                { label: '交通', value: 'transport' },
                { label: '购物', value: 'shopping' },
              ]}
              value={[categoryId]}
              onChange={v => v[0] && setCategoryId(v[0])}
            />
        </div>

        {/* Amount & Date & Note Form */}
        <div className="bg-white px-4 py-2">
           {/* Amount Display - Triggers Keyboard */}
           <div 
             className="flex items-baseline border-b border-gray-100 py-4 mb-4"
             onClick={() => {
                setKeyboardVisible(true);
                // In a real device, might need to blur other inputs
             }}
           >
             <span className="text-2xl font-bold mr-2">¥</span>
             <span className={`text-4xl font-mono ${!amount ? 'text-gray-300' : 'text-gray-900'}`}>
               {displayAmount}
             </span>
             <span className="ml-auto text-primary animate-pulse w-0.5 h-6 bg-primary opacity-50 block"></span>
           </div>

           <Form layout='horizontal'>
              {/* Date Picker Trigger */}
              <Form.Item label="日期" onClick={() => setDatePickerVisible(true)}>
                 <div className="flex items-center text-gray-700">
                    <span className="mr-2">{ICONS.calendar}</span>
                    {dayjs(date).format('YYYY年MM月DD日')}
                 </div>
              </Form.Item>

              {/* Account Selector (Mocked) */}
              <Form.Item label="账户">
                 <div onClick={() => {}} className="text-gray-700">
                   {accountId === 'cash' ? '现金账户' : '银行卡'}
                 </div>
              </Form.Item>

              {/* Note Input */}
              <Form.Item label="备注">
                <TextArea 
                  placeholder="写点备注..." 
                  value={note}
                  onChange={setNote}
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  maxLength={100}
                />
              </Form.Item>
           </Form>
        </div>
      </div>

      {/* 4. Action Button (Sticky Bottom above keyboard) */}
      <div className="fixed bottom-0 w-full bg-white z-50 safe-area-bottom">
         {/* If keyboard is NOT visible, show a big save button, 
             otherwise the keyboard usually has a confirm button */}
         {!keyboardVisible && (
            <div className="p-4 border-t border-gray-100">
              <Button 
                block 
                color="primary" 
                size="large" 
                onClick={handleSave}
                shape="rounded"
              >
                保存
              </Button>
            </div>
         )}

         {/* 5. Custom Number Keyboard */}
         <NumberKeyboard
            visible={keyboardVisible}
            onClose={() => setKeyboardVisible(false)}
            onInput={handleInputAmount}
            onDelete={handleDeleteAmount}
            confirmText="保存"
            onConfirm={handleSave}
            customKey="."
            safeArea
          />
      </div>

      {/* 6. Hidden Date Picker */}
      <DatePicker
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        value={date}
        onConfirm={v => setDate(v)}
        max={new Date()} // Can't select future dates usually
      />
    </div>
  );
};

export default RecordPage;