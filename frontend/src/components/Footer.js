import React from 'react';
import { Video, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo và mô tả */}
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Watch Party</h3>
              <p className="text-gray-400 text-sm">Xem phim cùng nhau</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              Về chúng tôi
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Hỗ trợ
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Điều khoản
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Bảo mật
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Watch Party. Được tạo với{' '}
            <Heart className="inline w-4 h-4 text-red-500" />{' '}
            bởi đội ngũ phát triển.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
