import React from 'react';
import { List, Card } from 'antd-mobile';
import { AddCircleOutline, BillOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';

const HomePage: React.FC = () => {
  return (
    <div className="p-4 pb-20">
      {/* Header Stats */}
      <div className="bg-primary text-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="text-sm opacity-80 mb-1">本月支出 (元)</div>
        <div className="text-4xl font-bold font-mono mb-4">2,480.00</div>
        <div className="flex justify-between text-sm opacity-90">
          <div>
            <div className="opacity-70 text-xs">本月收入</div>
            <div className="font-mono font-medium">15,000.00</div>
          </div>
          <div className="text-right">
             <div className="opacity-70 text-xs">结余</div>
             <div className="font-mono font-medium">+12,520.00</div>
          </div>
        </div>
      </div>

      {/* Daily List */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-lg">今日明细</h3>
        <span className="text-xs text-gray-500">{dayjs().format('MM月DD日')}</span>
      </div>

      <Card className="rounded-xl shadow-sm border-none mb-4">
        <List>
          <List.Item
            prefix={<div className="bg-blue-100 text-blue-600 p-2 rounded-full text-xl">🍔</div>}
            extra={<span className="font-bold text-gray-900">- 35.00</span>}
            description="12:30 · 现金账户"
          >
            午餐 (麦当劳)
          </List.Item>
          <List.Item
            prefix={<div className="bg-green-100 text-green-600 p-2 rounded-full text-xl">🚕</div>}
            extra={<span className="font-bold text-gray-900">- 42.50</span>}
            description="08:45 · 支付宝"
          >
            打车上班
          </List.Item>
           <List.Item
            prefix={<div className="bg-yellow-100 text-yellow-600 p-2 rounded-full text-xl">☕</div>}
            extra={<span className="font-bold text-gray-900">- 28.00</span>}
            description="15:00 · 微信钱包"
          >
            下午茶
          </List.Item>
        </List>
      </Card>
      
      <div className="text-center text-gray-400 text-xs mt-8">
        — 已经到底了 —
      </div>
    </div>
  );
};

export default HomePage;