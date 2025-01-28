'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div
          className="fixed inset-0 bg-[#0A0F1F]/95 backdrop-blur-2xl transition-opacity duration-500"
          onClick={onClose}
        />

        <div
          className={`relative w-full ${sizeClasses[size]} transform rounded-2xl bg-gradient-to-b from-[#0A0F1F] to-[#151933] border border-[#03E1FF]/20 p-6 text-left shadow-[0_0_50px_-12px_rgba(0,255,163,0.2)] transition-all duration-500 animate-modalShow`}
        >
          <div className="relative">
            {/* Premium decorative elements */}
            <div className="absolute -top-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#03E1FF]/50 to-transparent" />
            <div className="absolute -left-px top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#03E1FF]/50 to-transparent" />
            <div className="absolute -right-px top-[10%] bottom-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#03E1FF]/50 to-transparent" />
            <div className="absolute -bottom-px left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#03E1FF]/50 to-transparent" />

            <div className="flex items-center justify-between mb-6 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#00FFA3] to-[#03E1FF]" />
                <h3 className="text-xl font-semibold bg-gradient-to-r from-[#00FFA3] via-[#03E1FF] to-[#DC1FFF] bg-clip-text text-transparent">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="group relative rounded-lg p-2 text-gray-400 hover:text-white transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-lg border border-[#03E1FF]/0 group-hover:border-[#03E1FF]/20 transition-all duration-300" />
                <X className="h-5 w-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#0A0F1F] to-transparent pointer-events-none" />
              <div className="overflow-y-auto max-h-[calc(100vh-200px)] pr-2 scrollbar-thin scrollbar-track-[#151933] scrollbar-thumb-[#03E1FF]/20 hover:scrollbar-thumb-[#03E1FF]/30">
                {children}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#0A0F1F] to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
} 