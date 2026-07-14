import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Inbox, X } from 'lucide-react';

export const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <Loader2 className="w-10 h-10 text-emerald-700 animate-spin" />
    <p className="text-sm font-serif font-black text-emerald-900 uppercase tracking-[0.2em] animate-pulse">Lumière đang tải dữ liệu...</p>
  </div>
);

export const ErrorMessage = ({ message }) => (
  <div className="bg-rose-50/70 backdrop-blur-md border border-rose-200/50 p-6 rounded-[2rem] flex items-center space-x-4 shadow-premium-md">
    <div className="bg-rose-600 p-3 rounded-2xl text-white shadow-premium-sm">
      <AlertCircle className="w-5 h-5" />
    </div>
    <div>
      <h3 className="font-serif font-black text-rose-950">Đã xảy ra lỗi hệ thống</h3>
      <p className="text-rose-700/80 text-sm font-medium mt-0.5">{message}</p>
    </div>
  </div>
);

export const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 bg-white/60 backdrop-blur-sm rounded-[3rem] border border-dashed border-emerald-100 shadow-premium-sm">
    <div className="bg-emerald-50/50 p-6 rounded-full mb-6 border border-emerald-100/30">
      <Inbox className="w-12 h-12 text-emerald-800/30" />
    </div>
    <p className="text-emerald-950 font-serif font-black text-lg">{message}</p>
    <p className="text-emerald-800/50 text-xs uppercase tracking-widest mt-2">Vui lòng thử lại hoặc thay đổi bộ lọc.</p>
  </div>
);

export const Modal = ({ children, onClose, title, wide = false }) => (
  <AnimatePresence>
    <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`bg-white/95 backdrop-blur-xl w-full ${wide ? 'max-w-4xl' : 'max-w-md'} p-8 md:p-10 rounded-[2.5rem] shadow-premium-xl border border-emerald-100/30 relative overflow-hidden`}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 bg-emerald-50 hover:bg-emerald-800 hover:text-white rounded-full transition-all duration-300 cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5 text-emerald-800/70" />
        </button>
        {title && <h2 className="text-2xl md:text-3xl font-serif font-black mb-8 text-emerald-950 pr-12 leading-tight border-b border-emerald-100/10 pb-4">{title}</h2>}
        <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
);

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Xác nhận", cancelText = "Hủy", type = "danger" }) => {
  if (!isOpen) return null;
  return (
    <Modal onClose={onCancel} title={title}>
      <div className="space-y-6">
        <p className="text-emerald-950/80 font-medium leading-relaxed">{message}</p>
        <div className="flex gap-3 pt-4">
          <button 
            onClick={onCancel}
            className="flex-1 px-6 py-4 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all duration-300 cursor-pointer"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-white shadow-premium-md transition-all duration-300 cursor-pointer ${
              type === 'danger' 
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200/20' 
              : 'bg-emerald-800 hover:bg-emerald-950 shadow-emerald-200/20 border-b-2 border-gold'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
