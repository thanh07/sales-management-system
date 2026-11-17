/**
 * Tiện ích chuyển đổi tiếng Việt có dấu thành không dấu
 * và tạo các từ viết tắt (acronym) để tìm kiếm siêu nhanh.
 */

export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  // Combine marks
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str.trim();
}

/**
 * Tạo chuỗi viết tắt chữ cái đầu của mỗi từ
 * Ví dụ: "Bình Bông Mica A1" -> "bbma1"
 */
export function getAcronym(str: string): string {
  const clean = removeVietnameseTones(str);
  const words = clean.split(/[\s,._\-/]+/).filter(Boolean);
  return words.map((w) => w[0]).join('');
}

/**
 * Kiểm tra xem sản phẩm có khớp với từ khóa tìm kiếm thông minh không:
 * 1. Khớp chính xác hoặc chứa trong Barcode / SKU (không phân biệt hoa thường)
 * 2. Khớp tiếng Việt có dấu
 * 3. Khớp tiếng Việt không dấu (Accent-insensitive)
 * 4. Khớp chữ cái viết tắt (Acronym: "bbm" -> "Bình Bông Mica")
 * 5. Khớp mọi từ khóa con (Multi-token / out-of-order: "a1 mica" -> "Bình Bông Mica A1")
 */
export function matchSmartSearch(
  target: {
    name?: string;
    sku?: string;
    barcode?: string;
    brand?: string;
    category?: string;
    location?: string;
  },
  searchQuery: string
): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;

  const rawQuery = searchQuery.trim().toLowerCase();
  const noToneQuery = removeVietnameseTones(rawQuery);

  const barcode = (target.barcode || '').toLowerCase();
  const sku = (target.sku || '').toLowerCase();
  const name = (target.name || '').toLowerCase();
  const brand = (target.brand || '').toLowerCase();
  const category = (target.category || '').toLowerCase();
  const location = (target.location || '').toLowerCase();

  // 1. Khớp Barcode / SKU trực tiếp
  if (barcode.includes(rawQuery) || sku.includes(rawQuery) || sku.includes(noToneQuery)) {
    return true;
  }

  // Chuẩn bị văn bản không dấu của sản phẩm
  const nameNoTone = removeVietnameseTones(name);
  const brandNoTone = removeVietnameseTones(brand);
  const catNoTone = removeVietnameseTones(category);
  const locNoTone = removeVietnameseTones(location);

  const fullTextWithTone = `${name} ${sku} ${barcode} ${brand} ${category} ${location}`;
  const fullTextNoTone = `${nameNoTone} ${sku} ${barcode} ${brandNoTone} ${catNoTone} ${locNoTone}`;

  // 2. Khớp chuỗi đầy đủ (có dấu hoặc không dấu)
  if (fullTextWithTone.includes(rawQuery) || fullTextNoTone.includes(noToneQuery)) {
    return true;
  }

  // 3. Khớp theo chữ cái viết tắt (Acronym)
  const nameAcronym = getAcronym(name);
  const brandAcronym = getAcronym(brand);
  const fullAcronym = `${nameAcronym} ${brandAcronym}`;

  // Nếu người dùng gõ từ 2 ký tự trở lên không có khoảng trắng, thử so sánh với viết tắt
  if (!noToneQuery.includes(' ') && noToneQuery.length >= 2) {
    if (nameAcronym.includes(noToneQuery) || fullAcronym.includes(noToneQuery)) {
      return true;
    }
  }

  // 4. Khớp tất cả các từ con (Multi-keyword out-of-order)
  // Ví dụ: người dùng gõ "a1 mica" -> tách thành ["a1", "mica"]
  const tokens = noToneQuery.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const allTokensMatch = tokens.every((token) => fullTextNoTone.includes(token));
    if (allTokensMatch) {
      return true;
    }
  }

  return false;
}
