/**
 * MISA eShop Standard Smart Product Icon & Category Recognition
 * Automatically recognizes Vietnamese keywords in product name/category to assign vibrant icons and gradient themes.
 */

export interface SmartProductTheme {
  icon: string;
  badgeBg: string;
  gradientBg: string;
  categoryLabel: string;
}

export function getSmartProductIcon(name: string = '', category: string = ''): SmartProductTheme {
  const text = (name + ' ' + category).toLowerCase();

  // 1. Nước giải khát, Bia, Đồ uống
  if (text.includes('nước ngọt') || text.includes('bò cụng') || text.includes('red bull') || text.includes('pepsi') || text.includes('coca') || text.includes('sting') || text.includes('revive') || text.includes('cà phê') || text.includes('trà')) {
    return {
      icon: '🥤',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      gradientBg: 'from-cyan-900/40 via-blue-900/20 to-slate-950',
      categoryLabel: 'Đồ Uống / Nước Ngọt',
    };
  }

  if (text.includes('bia') || text.includes('heineken') || text.includes('tiger') || text.includes('saigon') || text.includes('rượu')) {
    return {
      icon: '🍺',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      gradientBg: 'from-amber-900/40 via-orange-900/20 to-slate-950',
      categoryLabel: 'Bia & Đồ Uống Có Cồn',
    };
  }

  // 2. Sữa & Đồ tươi
  if (text.includes('sữa') || text.includes('vinamilk') || text.includes('th true') || text.includes('milo') || text.includes('fami') || text.includes('yaourt') || text.includes('sữa chua')) {
    return {
      icon: '🥛',
      badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      gradientBg: 'from-blue-900/40 via-indigo-900/20 to-slate-950',
      categoryLabel: 'Sữa & Sản Phẩm Từ Sữa',
    };
  }

  // 3. Mì, Phở, Thực phẩm khô
  if (text.includes('mì') || text.includes('hảo hảo') || text.includes('omachi') || text.includes('phở') || text.includes('bún') || text.includes('miến') || text.includes('cháo') || text.includes('hủ tiếu')) {
    return {
      icon: '🍜',
      badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      gradientBg: 'from-orange-900/40 via-red-900/20 to-slate-950',
      categoryLabel: 'Mì, Phở & Thực Phẩm Khô',
    };
  }

  // 4. Bánh kẹo, Snack, Ăn vặt
  if (text.includes('bánh') || text.includes('kẹo') || text.includes('chocopie') || text.includes('oreo') || text.includes('snack') || text.includes('lay') || text.includes('oishi') || text.includes('khoai tây') || text.includes('socola')) {
    return {
      icon: '🍪',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      gradientBg: 'from-yellow-900/40 via-amber-900/20 to-slate-950',
      categoryLabel: 'Bánh Kẹo & Ăn Vặt',
    };
  }

  // 5. Gia vị & Nước chấm
  if (text.includes('nước mắm') || text.includes('tương ớt') || text.includes('chinsu') || text.includes('nam ngư') || text.includes('dầu ăn') || text.includes('muối') || text.includes('đường') || text.includes('bột ngọt') || text.includes('hạt nêm') || text.includes('tiêu') || text.includes('xì dầu') || text.includes('nước tương')) {
    return {
      icon: '🥫',
      badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
      gradientBg: 'from-red-900/40 via-rose-900/20 to-slate-950',
      categoryLabel: 'Gia Vị & Nước Chấm',
    };
  }

  // 6. Hóa mỹ phẩm, Tẩy rửa
  if (text.includes('rửa') || text.includes('sunlight') || text.includes('dầu gội') || text.includes('xà phòng') || text.includes('bột giặt') || text.includes('omo') || text.includes('comfort') || text.includes('kem đánh răng') || text.includes('ps') || text.includes('colgate') || text.includes('nước lau sàn') || text.includes('vim')) {
    return {
      icon: '🧼',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      gradientBg: 'from-emerald-900/40 via-teal-900/20 to-slate-950',
      categoryLabel: 'Hóa Mỹ Phẩm & Tẩy Rửa',
    };
  }

  // 7. Thời trang & Phụ kiện
  if (text.includes('áo') || text.includes('blazer') || text.includes('cardigan') || text.includes('sơ mi') || text.includes('thun') || text.includes('khoác')) {
    return {
      icon: '👕',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      gradientBg: 'from-purple-900/40 via-violet-900/20 to-slate-950',
      categoryLabel: 'Thời Trang / Áo',
    };
  }

  if (text.includes('quần') || text.includes('jean') || text.includes('kaki') || text.includes('tây') || text.includes('short')) {
    return {
      icon: '👖',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      gradientBg: 'from-indigo-900/40 via-blue-900/20 to-slate-950',
      categoryLabel: 'Thời Trang / Quần',
    };
  }

  if (text.includes('váy') || text.includes('đầm') || text.includes('yếm')) {
    return {
      icon: '👗',
      badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      gradientBg: 'from-pink-900/40 via-rose-900/20 to-slate-950',
      categoryLabel: 'Thời Trang / Váy Đầm',
    };
  }

  if (text.includes('giày') || text.includes('dép') || text.includes('sandal') || text.includes('sneaker')) {
    return {
      icon: '👟',
      badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
      gradientBg: 'from-teal-900/40 via-cyan-900/20 to-slate-950',
      categoryLabel: 'Giày Dép & Phụ Kiện',
    };
  }

  // 8. Combo đóng gói
  if (text.includes('combo') || text.includes('set') || text.includes('quà tặng')) {
    return {
      icon: '🎁',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      gradientBg: 'from-amber-900/50 via-yellow-900/30 to-slate-950',
      categoryLabel: 'Combo Đóng Gói Tiết Kiệm',
    };
  }

  // Default fallback
  return {
    icon: '📦',
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
    gradientBg: 'from-slate-900 via-slate-900/60 to-slate-950',
    categoryLabel: category || 'Hàng Hóa Tổng Hợp',
  };
}
