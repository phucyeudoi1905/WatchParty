import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      toast.error('Vui lòng nhập mã phòng');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ roomCode: roomCode.trim() })
      });

      if (response.ok) {
        const { room } = await response.json();
        toast.success(`Đã tham gia phòng ${room.name}`);
        navigate(`/room/${room._id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Không thể tham gia phòng');
      }
    } catch (error) {
      console.error('Lỗi khi tham gia phòng:', error);
      toast.error('Lỗi kết nối');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <span className="text-2xl">🚪</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Tham gia phòng
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập mã phòng để tham gia cùng bạn bè
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleJoinRoom}>
          <div>
            <label htmlFor="roomCode" className="sr-only">
              Mã phòng
            </label>
            <input
              id="roomCode"
              name="roomCode"
              type="text"
              required
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Nhập mã phòng (VD: ABC123)"
              maxLength={10}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang tham gia...
                </div>
              ) : (
                'Tham gia phòng'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              ← Quay lại Dashboard
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            💡 Làm thế nào để tham gia phòng?
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Nhận mã phòng từ người tạo phòng</li>
            <li>• Nhập mã phòng vào ô bên trên</li>
            <li>• Nhấn "Tham gia phòng"</li>
            <li>• Bắt đầu xem video và chat cùng nhau!</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">Hoặc</p>
          <button
            onClick={() => navigate('/create-room')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            🎬 Tạo phòng mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
