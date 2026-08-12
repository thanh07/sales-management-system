import React, { useState } from 'react';
import { usePosStore } from '../../store/posStore';
import { Plus, X, Receipt, Edit2, Check, History } from 'lucide-react';

export const OrderTabBar: React.FC = () => {
  const { tabs, activeTabId, addTab, closeTab, switchTab, renameTab } = usePosStore();
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(num) + 'đ';
  };

  const handleStartRename = (e: React.MouseEvent, tabId: string, currentName: string) => {
    e.stopPropagation();
    setEditingTabId(tabId);
    setEditingName(currentName);
  };

  const handleSaveRename = (tabId: string) => {
    if (editingName.trim()) {
      renameTab(tabId, editingName.trim());
    }
    setEditingTabId(null);
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/95 border-b border-slate-800 overflow-x-auto select-none no-scrollbar shrink-0">
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTabId;
          const totalItems = tab.cart.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = tab.cart.reduce((sum, item) => sum + item.selectedPrice * item.quantity, 0);

          return (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-150 shrink-0 ${
                isActive
                  ? 'bg-blue-600/20 border-blue-500/80 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Receipt className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />

              {editingTabId === tab.id ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(tab.id);
                      if (e.key === 'Escape') setEditingTabId(null);
                    }}
                    autoFocus
                    className="w-24 px-1.5 py-0.5 rounded bg-slate-950 border border-blue-500 text-white text-xs outline-none"
                  />
                  <button
                    onClick={() => handleSaveRename(tab.id)}
                    className="p-0.5 rounded hover:bg-blue-600 text-white"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span
                  onDoubleClick={(e) => handleStartRename(e, tab.id, tab.name)}
                  className="truncate max-w-[110px]"
                  title="Nhấp đúp để đổi tên hóa đơn"
                >
                  {tab.name}
                </span>
              )}

              {/* Item Count or Amount Badge */}
              {totalItems > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-emerald-400'
                  }`}
                >
                  {totalItems} | {formatVND(totalAmount)}
                </span>
              )}

              {/* Edit Name Button on Hover */}
              {isActive && editingTabId !== tab.id && (
                <button
                  onClick={(e) => handleStartRename(e, tab.id, tab.name)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-white transition-opacity"
                  title="Đổi tên hóa đơn"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
              )}

              {/* Close Tab Button */}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tab.cart.length > 0) {
                      if (confirm(`Đóng ${tab.name}? Các món trong hóa đơn này sẽ bị hủy.`)) {
                        closeTab(tab.id);
                      }
                    } else {
                      closeTab(tab.id);
                    }
                  }}
                  className="opacity-40 group-hover:opacity-100 hover:text-red-400 p-0.5 rounded transition-all"
                  title="Đóng hóa đơn này"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons: Add Tab & Order History */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => usePosStore.getState().setOrderHistoryModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold shrink-0 transition-all shadow-sm"
          title="Xem lịch sử hóa đơn trong ngày (F7)"
        >
          <History className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Lịch sử (F7)</span>
        </button>

        <button
          onClick={addTab}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold shrink-0 transition-all"
          title="Thêm hóa đơn mới (Ctrl+T)"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Hóa đơn mới</span>
        </button>
      </div>
    </div>
  );
};
