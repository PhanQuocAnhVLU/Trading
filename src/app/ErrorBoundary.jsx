import { Component } from 'react';
import Button from '../shared/components/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-surface px-4">
          <div className="text-center max-w-sm">
            <h1 className="text-lg font-bold text-text-primary">Đã xảy ra lỗi</h1>
            <p className="text-sm text-text-secondary mt-2">Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang.</p>
            <Button className="mt-6" onClick={() => window.location.reload()}>Tải lại trang</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
