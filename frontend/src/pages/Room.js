import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Tham gia phòng
    socket.emit('join-room', {
      roomId,
      userId: user._id,
      username: user.username
    });

    // Lắng nghe tin nhắn mới
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Lắng nghe người dùng tham gia
    socket.on('user-joined', (userData) => {
      toast.success(`${userData.username} đã tham gia phòng`);
    });

    // Lắng nghe danh sách người dùng trong phòng
    socket.on('room-users', (users) => {
      setUsersInRoom(users);
    });

    // Lấy thông tin phòng
    fetchRoomInfo();

    return () => {
      socket.emit('leave-room', { roomId, userId: user._id });
      socket.off('new-message');
      socket.off('user-joined');
      socket.off('room-users');
    };
  }, [socket, roomId, user]);

  const fetchRoomInfo = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const roomData = await response.json();
        setRoom(roomData);
      } else {
        toast.error('Không thể tải thông tin phòng');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Lỗi khi tải thông tin phòng:', error);
      toast.error('Lỗi kết nối');
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      roomId,
      content: newMessage,
      userId: user._id,
      username: user.username
    };

    socket.emit('send-message', messageData);
    setNewMessage('');
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // Implement video toggle logic here
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // Implement audio toggle logic here
  };

  const leaveRoom = () => {
    socket.emit('leave-room', { roomId, userId: user._id });
    navigate('/dashboard');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
              <p className="text-gray-600">{usersInRoom.length} người tham gia</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={toggleVideo}
                className={`px-4 py-2 rounded-lg ${
                  isVideoEnabled 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {isVideoEnabled ? 'Tắt Video' : 'Bật Video'}
              </button>
              <button
                onClick={toggleAudio}
                className={`px-4 py-2 rounded-lg ${
                  isAudioEnabled 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {isAudioEnabled ? 'Tắt Âm thanh' : 'Bật Âm thanh'}
              </button>
              <button
                onClick={leaveRoom}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Rời phòng
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Area */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
              {isVideoEnabled ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay
                  muted
                />
              ) : (
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">📹</div>
                  <p>Video đã tắt</p>
                </div>
              )}
            </div>
            
            {/* Video Controls */}
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${
                  isVideoEnabled ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'
                }`}
              >
                {isVideoEnabled ? '📹' : '🚫'}
              </button>
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full ${
                  isAudioEnabled ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'
                }`}
              >
                {isAudioEnabled ? '🔊' : '🔇'}
              </button>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border h-96 flex flex-col">
              {/* Chat Header */}
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Chat</h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.userId === user._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.userId === user._id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">
                        {message.username}
                      </div>
                      <div>{message.content}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Gửi
                  </button>
                </div>
              </div>
            </div>

            {/* Users in Room */}
            <div className="mt-4 bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Người tham gia</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {usersInRoom.map((userId) => (
                    <div key={userId} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {userId === user._id ? 'Bạn' : `User ${userId.slice(-4)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
