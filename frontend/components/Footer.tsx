import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1a0b2e] text-white py-12 border-t border-purple-900 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-purple-900/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex items-center gap-3">
             <span className="text-2xl font-bold text-purple-400">{'<'}</span>
             <span className="text-xl font-bold">Code:Me_</span>
             <span className="text-gray-400 mx-2">×</span>
             <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
             </div>
             <span className="text-xl font-bold">Hey Me_</span>
          </div>
          
          <p className="text-gray-400 text-sm">당신을 대신하는 AI 플랫폼</p>
          
          <div className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-purple-800 to-transparent my-8" />
          
          <div className="text-center">
            <p className="text-gray-500 text-xs">
              © 2025 Code:Me_. All rights reserved.<br/>
              Made with <span className="text-pink-500">♥</span> by AI Assistant
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;