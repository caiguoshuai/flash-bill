import React, { useState } from 'react';
import { Popup, Toast, Modal, Dialog, Input } from 'antd-mobile';
import { BillOutline, CheckOutline, LinkOutline, UserAddOutline, AddCircleOutline } from 'antd-mobile-icons';
import { useLedgerStore } from '../../store/useLedgerStore';
import { createInviteCode, joinLedger } from '../../services/ledger';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';

interface LedgerSidebarProps {
  visible: boolean;
  onClose: () => void;
}

const LedgerSidebar: React.FC<LedgerSidebarProps> = ({ visible, onClose }) => {
  const { ledgers, currentLedger, setCurrentLedger, addLedger, fetchLedgers } = useLedgerStore();

  // Dialog State for Join
  const [joinDialogVisible, setJoinDialogVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleSwitch = (ledger: any) => {
    setCurrentLedger(ledger);
    Toast.show({ content: '已切换到 ' + ledger.name, icon: 'success' });
    onClose();
  };

  const handleAdd = () => {
    const name = prompt("请输入新账本名称: ", "新账本");
    if (name) {
      addLedger(name, '📘');
      Toast.show({ content: '创建成功' });
    }
  };

  // Feature A: Share Ledger
  const handleShare = async (e: React.MouseEvent, ledgerId: string) => {
    e.stopPropagation();
    Toast.show({ icon: 'loading', content: 'generating...', duration: 0 });

    try {
      const res = await createInviteCode(ledgerId);
      Toast.clear();

      Modal.alert({
        title: '邀请好友加入',
        content: (
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl mt-2 border border-gray-100">
            <div className="text-gray-500 text-xs mb-2 uppercase tracking-wide">您的专属邀请码</div>
            <div className="text-5xl font-black text-gray-900 tracking-[0.2em] mb-4 font-mono">{res.code}</div>
            <div className="text-[10px] text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">有效期至 {res.expireAt}</div>
          </div>
        ),
        confirmText: '复制并关闭',
        onConfirm: () => {
          if (copy(res.code)) {
            Toast.show({ icon: 'success', content: '已复制' });
          }
        },
      });
    } catch (error) {
      Toast.clear();
      Toast.show({ icon: 'fail', content: '生成失败' });
    }
  };

  // Feature B: Join Ledger Handlers
  const handleJoin = () => {
    setJoinDialogVisible(true);
  };

  const confirmJoin = async () => {
    if (!inviteCode) {
      Toast.show({ content: '请输入邀请码' });
      return;
    }

    Toast.show({ icon: 'loading', content: '正在加入...', duration: 0 });
    try {
      await joinLedger(inviteCode);
      Toast.clear();
      Toast.show({ icon: 'success', content: '加入成功' });
      fetchLedgers();
      setJoinDialogVisible(false);
      setInviteCode('');
      onClose(); // Close sidebar after successful join
    } catch (error: any) {
      Toast.clear();
      Toast.show({ icon: 'fail', content: error.message || '加入失败' });
    }
  };

  return (
    <>
      <Popup
        visible={visible}
        onMaskClick={onClose}
        position='left'
        bodyStyle={{ width: '85vw', display: 'flex', flexDirection: 'column' }}
      >
        <div className="flex-1 bg-white flex flex-col h-full font-sans">
          {/* 1. Profile Header - Modern Gradient Card */}
          <div className="bg-gradient-to-br from-black to-gray-800 p-6 pt-12 pb-8 text-white relative overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-10 w-20 h-20 bg-blue-500 opacity-20 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-400 to-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg ring-4 ring-white/10">
                U
              </div>
              <div>
                <div className="font-bold text-xl tracking-tight">User Name</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 text-[10px] font-bold rounded-md">
                    PRO
                  </span>
                  <span className="text-xs text-gray-400">id: 8848</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Ledger List Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">我的账本</span>
              <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-md font-mono">{ledgers.length}</span>
            </div>

            {ledgers.map(item => {
              const isActive = currentLedger?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSwitch(item)}
                  className={classNames(
                    "relative group flex items-center p-3.5 rounded-2xl transition-all duration-300 cursor-pointer border overflow-hidden",
                    isActive
                      ? "bg-white border-blue-500/30 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.08)] scale-[1.02]"
                      : "bg-white border-transparent hover:bg-white hover:shadow-sm"
                  )}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>}

                  <div className={classNames(
                    "w-11 h-11 rounded-xl flex items-center justify-center text-xl mr-3.5 shadow-sm transition-colors",
                    isActive ? "bg-blue-50 text-2xl" : "bg-gray-50 text-xl grayscale-[0.5]"
                  )}>
                    {item.cover}
                  </div>

                  <div className="flex-1 min-w-0 mr-2">
                    <div className={classNames("font-bold text-[15px] truncate mb-0.5", isActive ? "text-gray-900" : "text-gray-700")}>
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={classNames(
                        "text-[10px] px-1.5 py-0.5 rounded-md font-medium",
                        item.role === 'owner' ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
                      )}>
                        {item.role === 'owner' ? '所有者' : '成员'}
                      </span>
                    </div>
                  </div>

                  {/* Share Button (Only visible on active or hover) */}
                  <div
                    className={classNames(
                      "w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95",
                      isActive ? "bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-500" : "opacity-0 group-hover:opacity-100 bg-gray-50 text-gray-400"
                    )}
                    onClick={(e) => handleShare(e, item.id)}
                  >
                    <LinkOutline fontSize={18} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Footer Actions */}
          <div className="p-4 bg-white border-t border-gray-100 safe-area-bottom">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAdd}
                className="flex flex-col items-center justify-center gap-1 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-700 py-3 rounded-xl border border-gray-200 transition-all font-bold text-xs"
              >
                <BillOutline fontSize={24} className="text-gray-800" />
                新建账本
              </button>
              <button
                onClick={handleJoin}
                className="flex flex-col items-center justify-center gap-1 bg-black hover:bg-gray-800 active:bg-gray-900 text-white py-3 rounded-xl shadow-lg shadow-gray-200 transition-all font-bold text-xs"
                style={{ backgroundColor: '#000000', color: '#ffffff' }}
              >
                <UserAddOutline fontSize={24} style={{ color: '#60a5fa' }} />
                加入账本
              </button>
            </div>
            <div className="text-center mt-3 text-[10px] text-gray-300">
              Flash Bill v1.0.2
            </div>
          </div>
        </div>
      </Popup>

      {/* Join Ledger Dialog - Z-Index 2000 to fix overlay issue */}
      <Dialog
        visible={joinDialogVisible}
        title={<div className="text-lg font-bold pt-2">加入新账本</div>}
        style={{ zIndex: 2000 }} // FIX: Ensure it appears above Popup (usually 1000)
        content={
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-2">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl">🤝</div>
              </div>
              <Input
                placeholder='输入 6 位邀请码'
                value={inviteCode}
                onChange={val => setInviteCode(val)}
                className="text-center font-mono text-xl tracking-[0.2em] font-bold bg-transparent placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal"
                autoFocus
              />
              <div className="h-0.5 bg-gray-200 w-1/2 mx-auto mt-1 rounded-full"></div>
            </div>
          </div>
        }
        closeOnAction={false} // Handle closing manually
        onClose={() => {
          setJoinDialogVisible(false);
          setInviteCode('');
        }}
        actions={[
          {
            key: 'confirm',
            text: '立即加入',
            className: 'text-primary font-bold',
            onClick: confirmJoin,
          },
          {
            key: 'cancel',
            text: '取消',
            className: 'text-gray-400',
            onClick: () => {
              setJoinDialogVisible(false);
              setInviteCode('');
            },
          },
        ]}
      />
    </>
  );
};

export default LedgerSidebar;
