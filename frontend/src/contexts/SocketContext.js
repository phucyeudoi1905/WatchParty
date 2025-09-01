import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Tạo kết nối socket mới
      const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket', 'polling']
      });

      // Xử lý kết nối
      newSocket.on('connect', () => {
        console.log('🔌 Kết nối Socket.io thành công');
        setIsConnected(true);
      });

      // Xử lý ngắt kết nối
      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Ngắt kết nối Socket.io:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server ngắt kết nối, thử kết nối lại
          newSocket.connect();
        }
      });

      // Xử lý lỗi kết nối
      newSocket.on('connect_error', (error) => {
        console.error('🔌 Lỗi kết nối Socket.io:', error);
        setIsConnected(false);
        toast.error('Lỗi kết nối realtime');
      });

      // Xử lý reconnect
      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔌 Kết nối lại Socket.io thành công sau', attemptNumber, 'lần thử');
        setIsConnected(true);
        toast.success('Đã kết nối lại realtime');
      });

      setSocket(newSocket);

      // Cleanup khi component unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Nếu không đăng nhập, đóng socket
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  // Hàm tham gia phòng
  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('join-room', {
        roomId,
        userId: user._id,
        username: user.username
      });
    }
  };

  // Hàm rời phòng
  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leave-room', {
        roomId,
        userId: user._id,
        username: user.username
      });
    }
  };

  // Hàm gửi tin nhắn
  const sendMessage = (roomId, message) => {
    if (socket && isConnected) {
      socket.emit('chat-message', {
        roomId,
        message,
        userId: user._id,
        username: user.username
      });
    }
  };

  // Hàm điều khiển video
  const sendVideoControl = (roomId, action, time) => {
    if (socket && isConnected) {
      socket.emit('video-control', {
        roomId,
        action,
        time,
        userId: user._id
      });
    }
  };

  // Yêu cầu đồng bộ trạng thái khi mới vào phòng
  const requestSync = (roomId) => {
    if (socket && isConnected) {
      socket.emit('request-sync', { roomId });
    }
  };

  // Gửi trạng thái hiện tại của video cho 1 người dùng cụ thể
  const sendSyncState = (roomId, targetUserId, time, isPlaying) => {
    if (socket && isConnected) {
      socket.emit('sync-state', { roomId, targetUserId, time, isPlaying });
    }
  };

  // Hàm lắng nghe sự kiện
  const onEvent = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      
      // Trả về hàm để hủy lắng nghe
      return () => socket.off(event, callback);
    }
  };

  // Hàm hủy lắng nghe sự kiện
  const offEvent = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendVideoControl,
    requestSync,
    sendSyncState,
    onEvent,
    offEvent
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
