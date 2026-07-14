import { Link } from 'react-router-dom';
import Button from '../shared/components/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-surface px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-primary font-data">404</p>
        <h1 className="text-xl font-bold text-text-primary mt-3">Không tìm thấy trang</h1>
        <p className="text-sm text-text-secondary mt-2">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
        <Link to="/">
          <Button className="mt-6">Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
