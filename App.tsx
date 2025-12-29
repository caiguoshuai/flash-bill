import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { TabBar, ConfigProvider } from 'antd-mobile';
import {
  BillOutline,
  AddCircleOutline,
  HistogramOutline,
  UserOutline,
} from 'antd-mobile-icons';
import zhCN from 'antd-mobile/es/locales/zh-CN';

import HomePage from './pages/home';
import RecordPage from './pages/bill/Record';
import StatisticsPage from './pages/statistics';
import ProfilePage from './pages/profile';

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const setRouteActive = (value: string) => {
    navigate(value);
  };

  const tabs = [
    {
      key: '/home',
      title: '明细',
      icon: <BillOutline />,
    },
    {
      key: '/record',
      title: '记账',
      icon: <AddCircleOutline />,
    },
    {
      key: '/statistics',
      title: '统计',
      icon: <HistogramOutline />,
    },
    {
      key: '/profile',
      title: '我的',
      icon: <UserOutline />,
    },
  ];

  return (
    <TabBar activeKey={pathname} onChange={value => setRouteActive(value)} className="border-t border-gray-100 bg-white">
      {tabs.map(item => (
        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
      ))}
    </TabBar>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const showTabBar = location.pathname !== '/record';

  return (
    // Outer container takes full height provided by #root
    <div className="flex flex-col h-full bg-gray-50 text-gray-900 font-sans">

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {children}
      </div>

      {/* Fixed-height TabBar Area */}
      {showTabBar && (
        <div className="flex-none bg-white border-t border-gray-100 safe-area-bottom z-50">
          <BottomNavigation />
        </div>
      )}
    </div>
  );
};

// Simple Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h2 className="text-lg font-bold">出错了 (Something went wrong)</h2>
          <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
            {this.state.error?.toString()}
          </pre>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => window.location.reload()}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <ErrorBoundary>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/home" element={<HomePage />} />
              <Route path="/record" element={<RecordPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ErrorBoundary>
    </ConfigProvider>
  );
};

export default App;