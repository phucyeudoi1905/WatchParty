import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Users, 
  Video, 
  Clock, 
  Eye,
  Copy,
  CheckCircle,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedRoomCode, setCopiedRoomCode] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/rooms');
      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Lỗi lấy danh sách phòng:', error);
      toast.error('Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = async (roomCode) => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopiedRoomCode(roomCode);
      toast.success('Đã sao chép mã phòng!');
      setTimeout(() => setCopiedRoomCode(null), 2000);
    } catch (error) {
      toast.error('Không thể sao chép mã phòng');
    }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng này?')) return;
    try {
      await axios.delete(`/api/rooms/${roomId}`);
      toast.success('Đã xóa phòng!');
      setRooms(rooms.filter(room => room.id !== roomId));
    } catch (error) {
      toast.error('Không thể xóa phòng');
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      label: 'Tổng phòng',
      value: rooms.length,
      icon: Video,
      color: 'bg-blue-500'
    },
    {
      label: 'Phòng đang hoạt động',
      value: rooms.filter(room => room.isActive).length,
      icon: Users,
      color: 'bg-green-500'
    },
    {
      label: 'Phòng riêng tư',
      value: rooms.filter(room => room.isPrivate).length,
      icon: Eye,
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Chào mừng trở lại, {user?.username}! Quản lý phòng xem phim của bạn.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex-1 max-w-md mb-4 sm:mb-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <Link
            to="/create-room"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo phòng mới</span>
          </Link>
        </div>

        {/* Rooms List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Danh sách phòng ({filteredRooms.length})
            </h2>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Không tìm thấy phòng nào' : 'Chưa có phòng nào'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Tạo phòng đầu tiên để bắt đầu xem phim cùng bạn bè!'
                }
              </p>
              {!searchTerm && (
                <Link to="/create-room" className="btn-primary">
                  Tạo phòng đầu tiên
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRooms.map((room) => (
                <div key={room.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {room.name}
                        </h3>
                        {room.isPrivate && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Riêng tư
                          </span>
                        )}
                        {room.hostId === user?._id && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Host
                          </span>
                        )}
                      </div>
                      
                      {room.description && (
                        <p className="text-gray-600 mb-2">{room.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{room.memberCount} thành viên</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(room.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Video className="w-4 h-4" />
                          <span className="capitalize">{room.videoType}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Room Code */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Mã phòng</p>
                        <div className="flex items-center space-x-2">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {room.roomCode}
                          </code>
                          <button
                            onClick={() => copyRoomCode(room.roomCode)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {copiedRoomCode === room.roomCode ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Join Button */}
                      <Link
                        to={`/room/${room.id}`}
                        className="btn-primary"
                      >
                        Tham gia
                      </Link>
                      {/* Delete Button */}
                      <button
                        onClick={() => deleteRoom(room.id)}
                        className="btn-danger flex items-center space-x-1 px-3 py-2 rounded"
                        title="Xóa phòng"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
