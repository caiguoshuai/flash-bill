import React from 'react';
import { NavBar, List, Button } from 'antd-mobile';
import { SetOutline, BillOutline, PayCircleOutline, UnorderedListOutline } from 'antd-mobile-icons';

const ProfilePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white">
                <NavBar back={null}>个人中心</NavBar>

                {/* User Card */}
                <div className="px-6 py-8 flex items-center">
                    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                        U
                    </div>
                    <div className="ml-4">
                        <div className="text-xl font-bold">用户 User</div>
                        <div className="text-gray-500 text-sm mt-1">坚持记账第 1 天</div>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <List header="常用功能">
                    <List.Item prefix={<BillOutline fontSize={24} />} onClick={() => { }}>账单导出</List.Item>
                    <List.Item prefix={<PayCircleOutline fontSize={24} />} onClick={() => { }}>预算设置</List.Item>
                    <List.Item prefix={<UnorderedListOutline fontSize={24} />} onClick={() => { }}>分类管理</List.Item>
                </List>

                <List header="系统" className="mt-4">
                    <List.Item prefix={<SetOutline fontSize={24} />} onClick={() => { }}>设置</List.Item>
                </List>
            </div>

            <div className="p-4 mt-8">
                <Button block color='danger' fill='outline' size='large'>退出登录</Button>
            </div>
        </div>
    );
};

export default ProfilePage;
