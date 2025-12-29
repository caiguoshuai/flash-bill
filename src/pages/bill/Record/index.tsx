import React, { useState, useMemo } from 'react';
import { 
  NavBar, 
  Tabs, 
  DatePicker, 
  NumberKeyboard, 
  Button, 
  Toast,
  Grid,
  List,
  Picker,
  Input
} from 'antd-mobile';
import { 
  BillOutline, 
  CalculatorOutline, 
  CalendarOutline, 
  ContentOutline 
} from 'antd-mobile-icons'; // Ensure icons are available or use text/emoji fallback if package not installed, we will use Emojis for zero-dep safety
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import classNames from 'classnames';
import { createTransaction } from '../../../services/bill';
import { TransactionType } from '../../../types/transaction';

// --- Mock Data ---

const CATEGORIES = {
  [TransactionType.EXPENSE]: [
    { id: 'food', name: '餐饮', icon: '🍔' },
    { id: 'shopping', name: '购物', icon: '🛍️' },
    { id: 'transport', name: '交通', icon: '🚗' },
    { id: 'home', name: '居住', icon: '🏠' },
    { id: 'entertainment', name: '娱乐', icon: '🎮' },
    { id: 'medical', name: '医疗', icon: '💊' },
    { id: 'study', name: '学习', icon: '📚' },
    { id: 'other', name: '其他', icon: '📝' },
  ],
  [TransactionType.INCOME]: [
    { id: 'salary', name: '工资', icon: '💰' },
    { id: 'bonus', name: '奖金', icon: '🧧' },
    { id: 'investment', name: '理财', icon: '📈' },
    { id: 'part-time', name: '兼职', icon: '🔨' },
    { id: 'other-in', name: '其他', icon: '💎' },
  ]
};

const ACCOUNTS = [
  { label: '现金账户', value: 'cash' },
  { label: '支付宝', value: 'alipay' },
  { label: '微信钱包', value: 'wechat' },
  { label: '招商银行', value: 'cmb' },
  { label: '信用卡', value: 'credit' },
];

const RecordPage: React.FC = () => {
  // --- State ---
  const [activeType, setActiveType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  
  // Date State
  const [date, setDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // Account State
  const [accountId, setAccountId] = useState<string>('cash');
  const [accountPickerVisible, setAccountPickerVisible] = useState(false);

  // UI State
  const [note, setNote] = useState<string>('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // --- Computed ---
  
  // Dynamic Theme Colors based on Type
  const themeColor = activeType === TransactionType.EXPENSE ? 'text-teal-600' : 'text-rose-500';
  const buttonColor = activeType === TransactionType.EXPENSE ? 'primary' : 'danger'; // Antd mobile doesn't support custom hex in 'color' prop easily, mapping to presets or using style
  const buttonStyle = activeType === TransactionType.EXPENSE 
    ? { background: '#0d9488', borderColor: '#0d9488' } // Tailwind teal-600
    : { background: '#f43f5e', borderColor: '#f43f5e' }; // Tailwind rose-500

  const currentCategories = CATEGORIES[activeType];

  const selectedAccountLabel = useMemo(() => {
    return ACCOUNTS.find(a => a.value === accountId)?.label || '选择账户';
  }, [accountId]);

  // --- Handlers ---

  const handleInputAmount = (value: string) => {
    if (value === '.' && amount.includes('.')) return;
    if (amount.includes('.') && amount.split('.')[1].length >= 2) return;
    if (amount.length > 10) return;
    setAmount(prev => prev + value);
  };

  const handleDeleteAmount = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handleTabChange = (key: string) => {
    const newType = parseInt(key) as TransactionType;
    setActiveType(newType);
    setCategoryId(''); // Reset category when switching types
  };

  const handleSave = async () => {
    // Validation
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      Toast.show({ content: '请输入有效金额', icon: 'fail' });
      setKeyboardVisible(true);
      return;
    }
    if (!categoryId) {
      Toast.show({ content: '请选择分类', icon: 'fail' });
      return;
    }

    const payload = {
      uuid: uuidv4(),
      ledgerId: 'default',
      accountId,
      categoryId,
      type: activeType,
      amount: Math.round(numericAmount * 100), // Convert to cents
      date: dayjs(date).format(),
      note: note.trim()
    };

    console.log('Creating Transaction Payload:', payload);

    try {
      Toast.show({ icon: 'loading', content: '保存中...', duration: 0 });
      await createTransaction(payload);
      Toast.clear();
      Toast.show({ icon: 'success', content: '已保存' });
      
      // Reset sensitive fields
      setAmount('');
      setNote('');
      setKeyboardVisible(false);
    } catch (e) {
      Toast.clear();
      // Error handled by interceptor
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* 1. Navbar */}
      <NavBar onBack={() => {}} className="bg-white">
        记一笔
      </NavBar>

      {/* 2. Type Tabs */}
      <div className="bg-white pb-2 shadow-sm z-10">
        <Tabs 
          activeKey={String(activeType)} 
          onChange={handleTabChange}
          style={{ 
            '--active-line-height': '3px',
            '--active-title-color': activeType === TransactionType.EXPENSE ? '#0d9488' : '#f43f5e',
            '--active-line-color': activeType === TransactionType.EXPENSE ? '#0d9488' : '#f43f5e',
          }}
        >
          <Tabs.Tab title="支出" key={String(TransactionType.EXPENSE)} />
          <Tabs.Tab title="收入" key={String(TransactionType.INCOME)} />
        </Tabs>
      </div>

      {/* 3. Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32"> {/* pb-32 to avoid hiding behind fixed keyboard */}
        
        {/* A. Amount Display Card */}
        <div className="m-4 mt-4 bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-center items-start transition-all active:scale-[0.99] duration-200"
             onClick={() => setKeyboardVisible(true)}
        >
          <div className="text-gray-400 text-sm font-medium mb-2">金额</div>
          <div className={classNames("flex items-baseline w-full", themeColor)}>
            <span className="text-3xl font-bold mr-2">¥</span>
            <span className={classNames(
              "text-6xl font-mono font-bold tracking-tighter",
              !amount && "text-gray-200"
            )}>
              {amount || '0.00'}
            </span>
            {/* Blinking Cursor Simulation */}
            {keyboardVisible && (
              <span className="w-1 h-12 ml-1 bg-current opacity-50 animate-pulse rounded-full" />
            )}
          </div>
        </div>

        {/* B. Category Grid */}
        <div className="bg-white mx-4 rounded-2xl shadow-sm p-4 mb-4">
          <div className="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wider">选择分类</div>
          <Grid columns={4} gap={12}>
            {currentCategories.map(cat => {
              const isActive = categoryId === cat.id;
              return (
                <Grid.Item key={cat.id} onClick={() => setCategoryId(cat.id)}>
                  <div className={classNames(
                    "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200",
                    isActive 
                      ? (activeType === TransactionType.EXPENSE ? "bg-teal-50 ring-2 ring-teal-500" : "bg-rose-50 ring-2 ring-rose-500") 
                      : "bg-gray-50 active:bg-gray-100"
                  )}>
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className={classNames(
                      "text-xs font-medium",
                      isActive 
                        ? (activeType === TransactionType.EXPENSE ? "text-teal-700" : "text-rose-700") 
                        : "text-gray-500"
                    )}>
                      {cat.name}
                    </div>
                  </div>
                </Grid.Item>
              )
            })}
          </Grid>
        </div>

        {/* C. Details List (Date, Account, Note) */}
        <div className="bg-white mx-4 rounded-2xl shadow-sm overflow-hidden">
          <List>
            <List.Item 
              onClick={() => setDatePickerVisible(true)}
              prefix={<span className="text-xl">📅</span>}
              extra={dayjs(date).format('YYYY年MM月DD日')}
            >
              日期
            </List.Item>
            
            <List.Item 
              onClick={() => setAccountPickerVisible(true)}
              prefix={<span className="text-xl">💳</span>}
              extra={selectedAccountLabel}
            >
              账户
            </List.Item>

            <List.Item prefix={<span className="text-xl">📝</span>}>
              <div className="py-1">
                <Input 
                  className="text-right"
                  placeholder="写点备注..." 
                  value={note}
                  onChange={setNote}
                  clearable
                />
              </div>
            </List.Item>
          </List>
        </div>
      </div>

      {/* 4. Bottom Interaction Area */}
      <div className="fixed bottom-0 w-full bg-white safe-area-bottom z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
         
         {/* If keyboard is hidden, show the Big Save Button */}
         {!keyboardVisible && (
           <div className="p-4">
             <Button 
               block 
               size="large" 
               shape="rounded"
               onClick={handleSave}
               style={{ 
                 ...buttonStyle,
                 color: '#fff',
                 fontWeight: 600,
                 fontSize: '18px',
                 boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
               }}
             >
               保 存
             </Button>
           </div>
         )}

         {/* Numeric Keyboard */}
         <NumberKeyboard
            visible={keyboardVisible}
            onClose={() => setKeyboardVisible(false)}
            onInput={handleInputAmount}
            onDelete={handleDeleteAmount}
            confirmText="确定"
            onConfirm={() => {
              setKeyboardVisible(false);
              // Optional: trigger save immediately if validated
              // handleSave(); 
            }}
            customKey="."
            safeArea
          />
      </div>

      {/* Modals */}
      <DatePicker
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        value={date}
        onConfirm={v => setDate(v)}
        max={new Date()}
      />

      <Picker
        visible={accountPickerVisible}
        onClose={() => setAccountPickerVisible(false)}
        value={[accountId]}
        onConfirm={v => v[0] && setAccountId(v[0] as string)}
        columns={[ACCOUNTS]}
      />
    </div>
  );
};

export default RecordPage;