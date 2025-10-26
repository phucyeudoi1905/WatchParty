import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Video, 
  Users, 
  MessageCircle, 
  Play, 
  ArrowRight,
  Star,
  Shield,
  Zap
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Video,
      title: 'Xem video đồng bộ',
      description: 'Tất cả thành viên xem video cùng lúc với điều khiển tập trung từ host.'
    },
    {
      icon: Users,
      title: 'Phòng xem chung',
      description: 'Tạo hoặc tham gia phòng với bạn bè để xem phim cùng nhau.'
    },
    {
      icon: MessageCircle,
      title: 'Chat realtime',
      description: 'Trò chuyện trong khi xem phim với giao diện chat hiện đại.'
    },
    {
      icon: Shield,
      title: 'Bảo mật cao',
      description: 'Hỗ trợ mật khẩu phòng và xác thực người dùng an toàn.'
    }
  ];

  const stats = [
    { label: 'Người dùng', value: '1000+' },
    { label: 'Phòng đã tạo', value: '500+' },
    { label: 'Giờ xem', value: '10,000+' },
    { label: 'Đánh giá', value: '4.9' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Xem phim cùng nhau
              <span className="text-primary-600"> thật dễ dàng</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Tạo phòng xem phim, mời bạn bè và thưởng thức những bộ phim yêu thích 
              cùng nhau trong thời gian thực. Đồng bộ video, chat và chia sẻ khoảnh khắc.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/create-room"
                    className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>Tạo phòng mới</span>
                  </Link>
                  <Link
                    to="/join-room"
                    className="btn-secondary text-lg px-8 py-4 flex items-center justify-center space-x-2"
                  >
                    <Users className="w-5 h-5" />
                    <span>Tham gia phòng</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2"
                  >
                    <span>Bắt đầu miễn phí</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary text-lg px-8 py-4 flex items-center justify-center space-x-2"
                  >
                    <span>Đăng nhập</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Trải nghiệm xem phim hoàn hảo với những tính năng được thiết kế 
              để mang mọi người lại gần nhau hơn.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cách hoạt động
            </h2>
            <p className="text-xl text-gray-600">
              Chỉ cần 3 bước đơn giản để bắt đầu xem phim cùng bạn bè
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tạo phòng</h3>
              <p className="text-gray-600">
                Tạo phòng mới với tên và video URL. Hệ thống sẽ tạo mã phòng duy nhất.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mời bạn bè</h3>
              <p className="text-gray-600">
                Chia sẻ mã phòng hoặc link để bạn bè tham gia vào phòng xem chung.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Xem cùng nhau</h3>
              <p className="text-gray-600">
                Bắt đầu xem phim với video đồng bộ và chat realtime với mọi người.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Tham gia cộng đồng Watch Party và tạo những kỷ niệm đáng nhớ 
            khi xem phim cùng bạn bè và gia đình.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/create-room"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Tạo phòng ngay</span>
              </Link>
            ) : (
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Đăng ký miễn phí</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
