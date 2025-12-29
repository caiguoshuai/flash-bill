import React, { useState, useEffect } from 'react';
import { TabBar } from 'antd-mobile';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  BillOutline, 
  PieOutline, 
  AddCircleOutline, 
  UserOutline 
} from 'antd-mobile-icons';

const BasicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeKey, setActiveKey] = useState<string>('/');

  // Sync TabBar with URL
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === '/' || pathname === '/stats' || pathname === '/mine') {
      setActiveKey(pathname);
    }
  }, [location.pathname]);

  const tabs = [
    {
      key: '/',
      title: '明细',
      icon: <BillOutline />,
    },
    {
      key: '/stats',
      title: '统计',
      icon: <PieOutline />,
    },
    {
      key: 'record', // Special Key
      title: '记一笔',
      icon: <AddCircleOutline fontSize={32} />, // Bigger icon
    },
    {
      key: '/mine',
      title: '我的',
      icon: <UserOutline />,
    },
  ];

  const handleTabChange = (key: string) => {
    if (key === 'record') {
      // Special action: Navigate to full screen record page
      navigate('/record');
    } else {
      setActiveKey(key);
      navigate(key);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      
      <div className="bg-white border-t border-gray-200 safe-area-bottom">
        <TabBar activeKey={activeKey} onChange={handleTabChange}>
          {tabs.map(item => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  );
};

export default BasicLayout;