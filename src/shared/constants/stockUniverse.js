// Mock universe of VN-market-style stocks. Reference prices in VND.
export const SECTORS = ['Ngân hàng', 'Bất động sản', 'Công nghệ', 'Bán lẻ', 'Năng lượng', 'Thép', 'Hàng không', 'Chứng khoán', 'Tiêu dùng'];

export const STOCK_UNIVERSE = [
  { symbol: 'VNM', name: 'CTCP Sữa Việt Nam', sector: 'Tiêu dùng', ref: 68500 },
  { symbol: 'VIC', name: 'Tập đoàn Vingroup', sector: 'Bất động sản', ref: 45200 },
  { symbol: 'VHM', name: 'CTCP Vinhomes', sector: 'Bất động sản', ref: 41800 },
  { symbol: 'VCB', name: 'Ngân hàng TMCP Ngoại thương VN', sector: 'Ngân hàng', ref: 91500 },
  { symbol: 'BID', name: 'Ngân hàng TMCP Đầu tư & PT VN', sector: 'Ngân hàng', ref: 48700 },
  { symbol: 'CTG', name: 'Ngân hàng TMCP Công thương VN', sector: 'Ngân hàng', ref: 34200 },
  { symbol: 'TCB', name: 'Ngân hàng TMCP Kỹ thương VN', sector: 'Ngân hàng', ref: 23100 },
  { symbol: 'MBB', name: 'Ngân hàng TMCP Quân đội', sector: 'Ngân hàng', ref: 21400 },
  { symbol: 'ACB', name: 'Ngân hàng TMCP Á Châu', sector: 'Ngân hàng', ref: 24800 },
  { symbol: 'VPB', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', sector: 'Ngân hàng', ref: 18900 },
  { symbol: 'STB', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', sector: 'Ngân hàng', ref: 29600 },
  { symbol: 'HPG', name: 'Tập đoàn Hòa Phát', sector: 'Thép', ref: 27300 },
  { symbol: 'HSG', name: 'Tập đoàn Hoa Sen', sector: 'Thép', ref: 16800 },
  { symbol: 'FPT', name: 'CTCP FPT', sector: 'Công nghệ', ref: 132400 },
  { symbol: 'CMG', name: 'CTCP Tập đoàn Công nghệ CMC', sector: 'Công nghệ', ref: 45600 },
  { symbol: 'MWG', name: 'CTCP Đầu tư Thế Giới Di Động', sector: 'Bán lẻ', ref: 52300 },
  { symbol: 'PNJ', name: 'CTCP Vàng bạc Đá quý Phú Nhuận', sector: 'Bán lẻ', ref: 89200 },
  { symbol: 'MSN', name: 'CTCP Tập đoàn Masan', sector: 'Tiêu dùng', ref: 71500 },
  { symbol: 'SAB', name: 'CTCP Bia Sài Gòn', sector: 'Tiêu dùng', ref: 58900 },
  { symbol: 'GAS', name: 'Tổng Công ty Khí Việt Nam', sector: 'Năng lượng', ref: 68200 },
  { symbol: 'PLX', name: 'Tập đoàn Xăng dầu VN', sector: 'Năng lượng', ref: 38700 },
  { symbol: 'POW', name: 'Tổng Công ty Điện lực Dầu khí VN', sector: 'Năng lượng', ref: 12900 },
  { symbol: 'SSI', name: 'CTCP Chứng khoán SSI', sector: 'Chứng khoán', ref: 31200 },
  { symbol: 'VND', name: 'CTCP Chứng khoán VNDirect', sector: 'Chứng khoán', ref: 15600 },
  { symbol: 'VCI', name: 'CTCP Chứng khoán Vietcap', sector: 'Chứng khoán', ref: 42100 },
  { symbol: 'VJC', name: 'CTCP Hàng không Vietjet', sector: 'Hàng không', ref: 104300 },
  { symbol: 'HVN', name: 'Tổng Công ty Hàng không VN', sector: 'Hàng không', ref: 14700 },
  { symbol: 'GVR', name: 'Tập đoàn Công nghiệp Cao su VN', sector: 'Bất động sản', ref: 29800 },
  { symbol: 'PDR', name: 'CTCP Phát triển BĐS Phát Đạt', sector: 'Bất động sản', ref: 19300 },
  { symbol: 'KDH', name: 'CTCP Đầu tư & KD Nhà Khang Điền', sector: 'Bất động sản', ref: 34500 },
];

export const INDICES = [
  { code: 'VN-INDEX', base: 1245.8 },
  { code: 'VN30', base: 1298.4 },
  { code: 'HNX-INDEX', base: 232.6 },
];
