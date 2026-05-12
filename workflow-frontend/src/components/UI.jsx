import { Loader2, AlertCircle, Info } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Đang tải...' }) => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    <p className="text-gray-500 font-medium">{message}</p>
  </div>
);

export const EmptyState = ({ message = 'Không có dữ liệu hiển thị.' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
    <Info className="w-12 h-12 text-gray-300 mb-2" />
    <p className="text-gray-500 font-medium">{message}</p>
  </div>
);

export const ErrorMessage = ({ message = 'Đã có lỗi xảy ra. Vui lòng thử lại.' }) => (
  <div className="flex items-center space-x-2 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
    <AlertCircle className="w-5 h-5" />
    <p className="font-medium">{message}</p>
  </div>
);
