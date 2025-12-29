import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import BasicLayout from '../layouts/BasicLayout';
import HomePage from '../pages/Home';
import RecordPage from '../pages/bill/Record';

// Placeholder components for missing pages
const StatsPage = () => <div className="p-4 text-center text-gray-500 mt-20">统计功能开发中...</div>;
const MinePage = () => <div className="p-4 text-center text-gray-500 mt-20">个人中心开发中...</div>;

const AppRouter: React.FC = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <BasicLayout />,
      children: [
        { path: '', element: <HomePage /> },
        { path: 'stats', element: <StatsPage /> },
        { path: 'mine', element: <MinePage /> },
      ],
    },
    {
      path: '/record',
      element: <RecordPage />,
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);

  return routes;
};

export default AppRouter;