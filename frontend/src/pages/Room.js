import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import { Settings } from 'lucide-react';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected, joinRoom, leaveRoom, sendMessage: sendSocketMessage, onEvent, sendVideoControl, requestSync, sendSyncState, sendTyping, sendMessageSeen } = useSocket();
  
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeReactionFor, setActiveReactionFor] = useState(null);
    const [showVideoUrlModal, setShowVideoUrlModal] = useState(false);
    const [newVideoUrl, setNewVideoUrl] = useState('');
    const [newVideoType, setNewVideoType] = useState('youtube');
  
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const applyingRemoteRef = useRef(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    joinRoom(roomId);

    const offChat = onEvent('chat-message', (data) => {
      const msg = {
        id: data.id || data._id || Math.random().toString(36).slice(2),
        userId: data.userId,
        username: data.username,
        content: data.content || data.message,
        timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
        reactions: data.reactions || [],
        seenBy: data.seenBy || []
      };
      setMessages(prev => [...prev, msg]);
      // emit seen for incoming messages not from self
      if (data.userId && data.userId !== user._id && msg.id) {
        try { sendMessageSeen(roomId, msg.id); } catch (_) {}
      }
    });

    const offJoined = onEvent('user-joined', (userData) => {
      toast.success(`${userData.username} đã tham gia phòng`);
    });

    const offUsers = onEvent('room-users', (users) => {
      setUsersInRoom(users);
    });

    const offTyping = onEvent('user-typing', ({ userId: typingId, username: typingName, isTyping }) => {
      if (typingId === user._id) return; // ignore self
      if (isTyping) {
        setTypingUser(typingName || 'Someone');
        // auto clear after 3s
        clearTimeout(window.__typingTimer);
        window.__typingTimer = setTimeout(() => setTypingUser(null), 3000);
      } else {
        setTypingUser(null);
      }
    });

    const offVideoUrlChanged = onEvent('video-url-changed', ({ videoUrl, videoType, updatedBy }) => {
      setRoom(prev => ({
        ...(prev || {}),
        videoUrl,
        videoType
      }));
      toast.success(`${updatedBy} đã thay đổi video`);
    });

    const offVideo = onEvent('video-control', (data) => {
      const { action, time, senderId } = data || {};
      if (senderId && socket && senderId === socket.id) return;
      const player = playerRef.current;
      const video = videoRef.current;

      // Ưu tiên đồng bộ theo player hiện có
      if (player) {
        applyingRemoteRef.current = true;
        if (typeof time === 'number' && !Number.isNaN(time)) {
          try { player.seekTo(time, 'seconds'); } catch (_) {}
        }
        if (action === 'play') {
          setIsPlaying(true);
        } else if (action === 'pause') {
          setIsPlaying(false);
        }
        setTimeout(() => { applyingRemoteRef.current = false; }, 250);
      } else if (video) {
        applyingRemoteRef.current = true;
        if (typeof time === 'number' && !Number.isNaN(time)) {
          const drift = Math.abs(video.currentTime - time);
          if (drift > 0.3) {
            video.currentTime = time;
          }
        }
        if (action === 'play') {
          video.play().catch(() => {});
        } else if (action === 'pause') {
          video.pause();
        } else if (action === 'seek') {
          if (typeof time === 'number') {
            video.currentTime = time;
          }
        }
        setTimeout(() => { applyingRemoteRef.current = false; }, 250);
      }
    });

    // Nhận trạng thái đồng bộ
    const offSyncState = onEvent('sync-state', ({ time, isPlaying: remotePlaying }) => {
      const player = playerRef.current;
      const video = videoRef.current;
      if (player) {
        applyingRemoteRef.current = true;
        try { player.seekTo((time ?? 0), 'seconds'); } catch (_) {}
        setIsPlaying(!!remotePlaying);
        setTimeout(() => { applyingRemoteRef.current = false; }, 120);
      } else if (video) {
        applyingRemoteRef.current = true;
        if (typeof time === 'number' && !Number.isNaN(time)) {
          video.currentTime = time;
        }
        if (remotePlaying) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
        setTimeout(() => { applyingRemoteRef.current = false; }, 120);
      }
    });

    // Khi có yêu cầu đồng bộ từ người khác, gửi trạng thái hiện tại
    const offRequestSync = onEvent('request-sync', ({ requesterId }) => {
      const player = playerRef.current;
      const video = videoRef.current;
      if (player) {
        const current = player?.getCurrentTime ? player.getCurrentTime() : 0;
        sendSyncState(roomId, requesterId, current || 0, isPlaying);
      } else if (video) {
        sendSyncState(roomId, requesterId, video.currentTime || 0, !video.paused);
      }
    });

    // Yêu cầu đồng bộ sau khi đã đăng ký listener
    requestSync(roomId);

    // Lấy thông tin phòng
    (async () => {
      try {
        console.log('[Room] fetching room', roomId);
        const response = await fetch(`/api/rooms/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('[Room] fetch response status', response.status);
        
        if (response.ok) {
          const roomData = await response.json();
          console.log('[Room] room data', roomData);
          setRoom(roomData.room || roomData);
        } else {
          toast.error('Không thể tải thông tin phòng');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin phòng:', error);
        toast.error('Lỗi kết nối');
      }
    })();

    return () => {
      leaveRoom(roomId);
      offChat && offChat();
      offJoined && offJoined();
      offUsers && offUsers();
      offVideo && offVideo();
      offTyping && offTyping();
      offVideoUrlChanged && offVideoUrlChanged();
      offSyncState && offSyncState();
      offRequestSync && offRequestSync();
    };
  }, [socket, isConnected, roomId, user, joinRoom, leaveRoom, onEvent, navigate, requestSync, sendSyncState, isPlaying]);
  // Normalize IDs: backend may return hostId as ObjectId or string; user object may have `id` (from toPublicJSON) or `_id`.
  const normalizeId = (val) => {
    if (!val && val !== 0) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      if (val._id) return String(val._id);
      if (val.id) return String(val.id);
      try { return String(val); } catch (_) { return null; }
    }
    return String(val);
  };

  const roomHostId = normalizeId(room?.hostId);
  const userId = normalizeId(user?._id ?? user?.id ?? user);

  const isHost = !!(roomHostId && userId && roomHostId === userId);

  const allowVideoControl = !!(room && room.settings && room.settings.allowVideoControl);

  const toggleAllowVideoControl = async () => {
    if (!isHost) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ settings: { allowVideoControl: !allowVideoControl } })
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Cập nhật thất bại');
      }
      const data = await res.json();
      const updated = data.room || data;
      setRoom(prev => ({ ...(prev || {}), ...(updated || {}) }));
      toast.success(!allowVideoControl ? 'Đã bật quyền điều khiển video cho thành viên' : 'Đã tắt quyền điều khiển video cho thành viên');
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật cài đặt phòng');
    }
  };

  const copyRoomCode = async () => {
    if (!room?.roomCode) return;
    try {
      await navigator.clipboard.writeText(room.roomCode);
      toast.success('Đã sao chép mã phòng');
    } catch (_) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = room.roomCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Đã sao chép mã phòng');
    }
  };

  const handleDeleteRoom = async () => {
    if (!isHost) return;
    const ok = window.confirm('Bạn có chắc muốn xóa phòng này? Hành động không thể hoàn tác.');
    if (!ok) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Xóa phòng thất bại');
      }
      toast.success('Đã xóa phòng');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Không thể xóa phòng');
    }
  };

  const transferHost = async (targetUserId) => {
    if (!isHost || !targetUserId) return;
    const ok = window.confirm('Chuyển quyền chủ phòng cho thành viên này?');
    if (!ok) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}/transfer-host`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ targetUserId })
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Không thể chuyển quyền');
      }
      const data = await res.json();
      const updated = data.room || data;
      setRoom(prev => ({ ...(prev || {}), ...(updated || {}) }));
      toast.success('Đã chuyển quyền chủ phòng');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Không thể chuyển quyền');
    }
  };
  
  const handleChangeVideoUrl = async () => {
    if (!isHost) {
      toast.error('Chỉ host mới có quyền thay đổi URL');
      return;
    }
    if (!newVideoUrl.trim()) {
      toast.error('Vui lòng nhập URL hợp lệ');
      return;
    }

    try {
      console.log('[Room] PUT /api/rooms/' + roomId + '/video-url', { videoUrl: newVideoUrl, videoType: newVideoType });
      const res = await fetch(`/api/rooms/${roomId}/video-url`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          videoUrl: newVideoUrl,
          videoType: newVideoType
        })
      });

      const text = await res.text();
      let body = null;
      try { body = JSON.parse(text); } catch (_) { body = { raw: text }; }
      console.log('[Room] video-url response', res.status, body);

      if (!res.ok) {
        const message = body?.error || body?.message || (body?.details ? JSON.stringify(body.details) : null) || `Lỗi server (${res.status})`;
        toast.error('Không thể cập nhật URL: ' + message);
        return;
      }

      const data = body || {};
      const updated = data.room || data;
      setRoom(prev => ({ ...(prev || {}), ...(updated || {}) }));
      setShowVideoUrlModal(false);
      setNewVideoUrl('');
      toast.success('Đã cập nhật URL video mới');
    } catch (err) {
      console.error('Lỗi khi gọi API cập nhật URL video:', err);
      toast.error('Lỗi khi gửi yêu cầu cập nhật URL');
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    sendSocketMessage(roomId, newMessage);
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const EMOJIS = ['👍','❤️','😂','😮','😢','😡','😊','🔥','🎉','👏','😎','🙏'];

  const appendEmoji = (emoji) => {
    setNewMessage(prev => (prev || '') + emoji);
  };

  const toggleReaction = async (messageId, emoji) => {
    if (!messageId) return;
    try {
      const res = await fetch(`/api/messages/${roomId}/${messageId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ emoji })
      });
      if (!res.ok) return;
      const body = await res.json();
      const updated = body?.data;
      if (updated && updated.id) {
        setMessages(prev => prev.map(m => (m.id === updated.id ? { ...m, reactions: updated.reactions } : m)));
      }
    } catch (_) {}
  };

  // typing emit
  useEffect(() => {
    if (!socket || !isConnected) return;
    if (newMessage && newMessage.length > 0) {
      sendTyping(roomId, true);
    }
    const t = setTimeout(() => sendTyping(roomId, false), 1000);
    return () => clearTimeout(t);
  }, [newMessage, socket, isConnected, roomId, sendTyping]);

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // Implement video toggle logic here
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // Implement audio toggle logic here
  };

  const handleLeaveRoom = () => {
    leaveRoom(roomId);
    navigate('/dashboard');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Gửi sự kiện điều khiển video khi local video thay đổi (HTML5 video)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !socket || !isConnected) return;

    const handlePlay = () => { if (!applyingRemoteRef.current) sendVideoControl(roomId, 'play', video.currentTime); };
    const handlePause = () => { if (!applyingRemoteRef.current) sendVideoControl(roomId, 'pause', video.currentTime); };
    const handleSeeked = () => { if (!applyingRemoteRef.current) sendVideoControl(roomId, 'seek', video.currentTime); };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [socket, isConnected, roomId, sendVideoControl, room?.videoType, room?.videoUrl]);

  const handleReactPlayerPlay = () => {
    const player = playerRef.current;
    const current = player?.getCurrentTime ? player.getCurrentTime() : 0;
    setIsPlaying(true);
    if (!applyingRemoteRef.current) {
      sendVideoControl(roomId, 'play', current || 0);
    }
  };

  const handleReactPlayerPause = () => {
    const player = playerRef.current;
    const current = player?.getCurrentTime ? player.getCurrentTime() : 0;
    setIsPlaying(false);
    if (!applyingRemoteRef.current) {
      sendVideoControl(roomId, 'pause', current || 0);
    }
  };

  const handleReactPlayerSeek = (seconds) => {
    if (!applyingRemoteRef.current) {
      sendVideoControl(roomId, 'seek', seconds || 0);
    }
  };

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
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <span className="text-gray-500">Mã phòng:</span>
                  <span className="font-semibold tracking-wider">{room.roomCode || '—'}</span>
                  {room.roomCode && (
                    <button
                      onClick={copyRoomCode}
                      className="px-2 py-0.5 text-xs rounded border border-gray-300 hover:bg-gray-50"
                      title="Sao chép mã phòng"
                    >
                      Sao chép
                    </button>
                  )}
                </span>
                <span className="hidden sm:inline text-gray-400">•</span>
                <span className="inline-flex items-center gap-1">
                  <span className="text-gray-500">Chủ phòng:</span>
                  <span className="font-medium">
                    {(room?.hostId && typeof room.hostId === 'object' && room.hostId.username) ? room.hostId.username : '—'}
                  </span>
                </span>
                <span className="inline-flex items-center">
                  {room.isPrivate ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">Riêng tư</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Công khai</span>
                  )}
                </span>
                <span className="hidden sm:inline text-gray-400">•</span>
                <span className="text-gray-600">{usersInRoom.length} người tham gia</span>
              </div>
            </div>
            <div className="flex space-x-3 items-center">
              {/* Removed: allowVideoControl toggle and delete room buttons per request */}
              {isHost && (
                <button
                  onClick={() => { setShowVideoUrlModal(true); setNewVideoUrl(room?.videoUrl || ''); setNewVideoType(room?.videoType || 'youtube'); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white border border-blue-600 hover:bg-blue-700"
                  title="Cài đặt phòng"
                >
                  <Settings className="w-4 h-4 text-white" />
                  <span className="hidden sm:inline">Setting</span>
                </button>
              )}
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
                    ? 'bg-green-600 text-white border border-green-600' 
                    : 'bg-gray-200 text-gray-700 border border-gray-300'
                }`}
              >
                {isAudioEnabled ? 'Tắt Âm thanh' : 'Bật Âm thanh'}
              </button>
              <button
                onClick={handleLeaveRoom}
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
                (() => {
                  const isYouTube = (room?.videoType || '').toLowerCase() === 'youtube' || (room?.videoUrl || '').includes('youtu');
                  if (isYouTube) {
                    return (
                      <ReactPlayer
                        ref={playerRef}
                        url={room?.videoUrl}
                        width="100%"
                        height="100%"
                        playing={isPlaying}
                        controls
                        muted={!isAudioEnabled}
                        onPlay={handleReactPlayerPlay}
                        onPause={handleReactPlayerPause}
                        onSeek={handleReactPlayerSeek}
                      />
                    );
                  }
                  return (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover rounded-lg"
                      autoPlay
                      muted={!isAudioEnabled}
                      controls
                      src={room?.videoUrl || ''}
                    />
                  );
                })()
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
                    key={message.id || index}
                    className={`flex flex-col ${
                      message.userId === user._id ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`group max-w-xs px-3 py-2 rounded-lg ${
                        message.userId === user._id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                      onPointerDown={() => {
                        if (!message.id) return;
                        setActiveReactionFor(message.id);
                        clearTimeout(window.__lpTimer);
                        window.__lpTimer = setTimeout(() => setActiveReactionFor(null), 2500);
                      }}
                      onPointerUp={() => {
                        clearTimeout(window.__lpTimer);
                      }}
                      onPointerLeave={() => {
                        clearTimeout(window.__lpTimer);
                      }}
                    >
                      <div className="text-xs opacity-75 mb-1">
                        {message.username}
                      </div>
                      <div>{message.content}</div>
                      {Array.isArray(message.reactions) && message.reactions.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries((message.reactions || []).reduce((acc, r) => {
                            acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc;
                          }, {})).map(([emo, count]) => (
                            <span key={emo} className="text-[10px] px-1.5 py-0.5 bg-black/10 rounded-full">
                              {emo} {count}
                            </span>
                          ))}
                        </div>
                      )}
                      {Array.isArray(message.seenBy) && message.seenBy.length > 0 && (
                        <div className="mt-1 text-[10px] opacity-70 flex items-center space-x-1">
                          <span>Seen by</span>
                          <span>{message.seenBy.map(s => s.username || 'User').join(', ')}</span>
                        </div>
                      )}
                    </div>
                    {message.id && (
                      <div
                        className="mt-1 flex gap-1 opacity-0 group-hover:opacity-70 transition-opacity duration-150"
                        style={{ opacity: activeReactionFor === message.id ? 0.7 : undefined }}
                      >
                        {['👍','❤️','😂','😮','😢','😡'].map(emo => (
                          <button
                            key={emo}
                            onClick={() => toggleReaction(message.id, emo)}
                            className="text-[12px] hover:opacity-100"
                            title={`React ${emo}`}
                          >
                            {emo}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker((s) => !s)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Emoji"
                    >
                      🙂
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 z-10 p-2 w-52 bg-white border rounded-lg shadow-sm grid grid-cols-6 gap-1">
                        {EMOJIS.map((e) => (
                          <button
                            key={e}
                            onClick={() => appendEmoji(e)}
                            className="text-xl hover:bg-gray-100 rounded"
                            title={e}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                {typingUser && (
                  <div className="mt-2 text-xs text-gray-500">{typingUser} is typing...</div>
                )}
              </div>
            </div>

            {/* Users in Room */}
            <div className="mt-4 bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Người tham gia</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {(room?.members || []).map((m) => (
                    <div key={m.userId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">
                          {m.username} {m.isHost ? '(Host)' : m.isModerator ? '(Mod)' : ''} {m.userId === user._id ? '(Bạn)' : ''}
                        </span>
                      </div>
                      {isHost && !m.isHost && (
                        <button
                          onClick={() => transferHost(m.userId)}
                          className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                        >
                          Chuyển quyền chủ phòng
                        </button>
                      )}
                    </div>
                  ))}
                  {(!room?.members || room.members.length === 0) && (
                    <div className="text-sm text-gray-500">Chưa có dữ liệu thành viên.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal: Change Video URL (only visible to host) */}
      {showVideoUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-3">Thay đổi URL video</h3>
            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">URL video</label>
              <input
                type="text"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Loại video</label>
              <select value={newVideoType} onChange={(e) => setNewVideoType(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="youtube">YouTube</option>
                <option value="hls">HLS</option>
                <option value="mp4">MP4</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowVideoUrlModal(false)} className="px-4 py-2 rounded-lg border">Hủy</button>
              <button onClick={handleChangeVideoUrl} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Lưu</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Room;
