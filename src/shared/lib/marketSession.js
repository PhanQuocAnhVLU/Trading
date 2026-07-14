// Mirrors real HOSE trading session structure (VN time, Mon–Fri)
export function getMarketSession(date = new Date()) {
  const day = date.getDay(); // 0 Sun .. 6 Sat
  const minutes = date.getHours() * 60 + date.getMinutes();

  if (day === 0 || day === 6) {
    return { phase: 'closed', label: 'Thị trường đóng cửa (cuối tuần)', color: 'neutral' };
  }

  const ATO_START = 9 * 60;
  const ATO_END = 9 * 60 + 15;
  const CONT1_END = 11 * 60 + 30;
  const LUNCH_END = 13 * 60;
  const CONT2_END = 14 * 60 + 30;
  const ATC_END = 14 * 60 + 45;
  const PT_END = 15 * 60; // put-through / off-hours deal time

  if (minutes < ATO_START) return { phase: 'closed', label: 'Chưa mở cửa', color: 'neutral' };
  if (minutes < ATO_END) return { phase: 'ato', label: 'Phiên ATO — Khớp lệnh định kỳ mở cửa', color: 'warning' };
  if (minutes < CONT1_END) return { phase: 'continuous', label: 'Khớp lệnh liên tục', color: 'success' };
  if (minutes < LUNCH_END) return { phase: 'break', label: 'Nghỉ giữa phiên', color: 'neutral' };
  if (minutes < CONT2_END) return { phase: 'continuous', label: 'Khớp lệnh liên tục', color: 'success' };
  if (minutes < ATC_END) return { phase: 'atc', label: 'Phiên ATC — Khớp lệnh định kỳ đóng cửa', color: 'warning' };
  if (minutes < PT_END) return { phase: 'pt', label: 'Giao dịch thoả thuận', color: 'info' };
  return { phase: 'closed', label: 'Đã đóng cửa phiên', color: 'neutral' };
}
