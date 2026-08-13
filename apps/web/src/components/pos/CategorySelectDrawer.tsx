import React from 'react';
import { Tag, X, Check } from 'lucide-react';

interface CategorySelectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategorySelectDrawer: React.FC<CategorySelectDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  if (!isOpen) return null;

  const allCategories = ['Tất cả', ...categories];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-end">
      <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <Tag className="w-5 h-5" />
            <h3 className="text-base text-white">Lọc Theo Danh Mục Sản Phẩm</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {allCategories.map((c) => {
            const catName = typeof c === 'string' ? c : (c as any)?.name || '';
            const isSelected = selectedCategory === catName;
            return (
              <div
                key={catName}
                onClick={() => onSelectCategory(catName)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs font-semibold ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span>{catName}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-400" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
