import {
  LayoutDashboard, LineChart, ArrowLeftRight, Briefcase, Star,
  Bell, FileText, Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'Tổng quan', path: '/', icon: LayoutDashboard },
  { label: 'Thị trường', path: '/market', icon: LineChart },
  { label: 'Đặt lệnh', path: '/trading', icon: ArrowLeftRight },
  { label: 'Danh mục', path: '/portfolio', icon: Briefcase },
  { label: 'Theo dõi', path: '/watchlist', icon: Star },
  { label: 'Cảnh báo', path: '/alerts', icon: Bell },
  { label: 'Báo cáo', path: '/reports', icon: FileText },
  { label: 'Cài đặt', path: '/settings', icon: Settings },
];
