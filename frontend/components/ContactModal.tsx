import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setSubmitted(false);
        setIsLoading(false);
        setEmail('');
        setName('');
        setCompany('');
        setMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setSubmitted(true);
    setTimeout(() => {
        onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <Icons.Close size={20} />
        </button>

        {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <Icons.Check size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">문의가 접수되었습니다!</h2>
                <p className="text-gray-500">영업팀에서 검토 후 빠르게 연락드리겠습니다.</p>
            </div>
        ) : (
            <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Enterprise 문의</h2>
                <p className="text-gray-500 text-sm mb-6">
                    기업을 위한 맞춤형 솔루션에 대해 상담해드립니다.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <label className="text-xs font-semibold text-gray-700 ml-1 mb-1 block">이름</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="홍길동"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                            required
                        />
                    </div>
                    <div className="relative">
                        <label className="text-xs font-semibold text-gray-700 ml-1 mb-1 block">회사명</label>
                        <input 
                            type="text" 
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="회사명 입력"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>
                
                <div className="relative">
                    <label className="text-xs font-semibold text-gray-700 ml-1 mb-1 block">업무용 이메일</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                        required
                    />
                </div>

                <div className="relative">
                    <label className="text-xs font-semibold text-gray-700 ml-1 mb-1 block">문의 내용</label>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="어떤 점이 궁금하신가요?"
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
                        required
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-2 border border-transparent rounded-xl hover:bg-gray-800 transition-colors bg-gray-900 text-white font-bold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        '문의하기'
                    )}
                </button>
                </form>
            </>
        )}
      </div>
    </div>
  );
};

export default ContactModal;