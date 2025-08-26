import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Video, 
  Lock, 
  Users, 
  Eye, 
  EyeOff,
  AlertCircle,
  Plus
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateRoom = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const isPrivate = watch('isPrivate');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/rooms', data);
      toast.success('Tạo phòng thành công!');
      navigate(`/room/${response.data.room.id}`);
    } catch (error) {
      const message = error.response?.data?.error || 'Lỗi tạo phòng';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo phòng mới</h1>
          <p className="text-gray-600 mt-2">
            Tạo phòng xem phim và mời bạn bè tham gia
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Room Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Tên phòng <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name', {
                  required: 'Tên phòng là bắt buộc',
                  minLength: {
                    value: 3,
                    message: 'Tên phòng phải có ít nhất 3 ký tự'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Tên phòng không được quá 100 ký tự'
                  }
                })}
                className={`input ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Nhập tên phòng"
              />
              {errors.name && (
                <p className="form-error flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Mô tả
              </label>
              <textarea
                id="description"
                rows={3}
                {...register('description', {
                  maxLength: {
                    value: 500,
                    message: 'Mô tả không được quá 500 ký tự'
                  }
                })}
                className={`input ${errors.description ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Mô tả về phòng xem phim (tùy chọn)"
              />
              {errors.description && (
                <p className="form-error flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Video URL */}
            <div className="form-group">
              <label htmlFor="videoUrl" className="form-label">
                URL Video <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Video className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="videoUrl"
                  type="url"
                  {...register('videoUrl', {
                    required: 'URL video là bắt buộc',
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'URL video phải bắt đầu bằng http:// hoặc https://'
                    }
                  })}
                  className={`input pl-10 ${errors.videoUrl ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              {errors.videoUrl && (
                <p className="form-error flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.videoUrl.message}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Hỗ trợ YouTube, HLS, MP4 và các định dạng video khác
              </p>
            </div>

            {/* Video Type */}
            <div className="form-group">
              <label htmlFor="videoType" className="form-label">
                Loại video
              </label>
              <select
                id="videoType"
                {...register('videoType')}
                className="input"
              >
                <option value="youtube">YouTube</option>
                <option value="hls">HLS Stream</option>
                <option value="mp4">MP4/Video File</option>
              </select>
            </div>

            {/* Privacy Settings */}
            <div className="form-group">
              <div className="flex items-center space-x-3">
                <input
                  id="isPrivate"
                  type="checkbox"
                  {...register('isPrivate')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isPrivate" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Phòng riêng tư</span>
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-7">
                Phòng riêng tư sẽ không hiển thị trong danh sách công khai
              </p>
            </div>

            {/* Password (if private) */}
            {isPrivate && (
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Mật khẩu phòng
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      minLength: {
                        value: 4,
                        message: 'Mật khẩu phải có ít nhất 4 ký tự'
                      },
                      maxLength: {
                        value: 20,
                        message: 'Mật khẩu không được quá 20 ký tự'
                      }
                    })}
                    className={`input pl-10 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Nhập mật khẩu phòng (tùy chọn)"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="form-error flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.password.message}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Để trống nếu không muốn đặt mật khẩu
                </p>
              </div>
            )}

            {/* Max Members */}
            <div className="form-group">
              <label htmlFor="maxMembers" className="form-label">
                Số thành viên tối đa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="maxMembers"
                  type="number"
                  min="2"
                  max="100"
                  {...register('maxMembers', {
                    min: {
                      value: 2,
                      message: 'Phòng phải có ít nhất 2 thành viên'
                    },
                    max: {
                      value: 100,
                      message: 'Phòng không được quá 100 thành viên'
                    }
                  })}
                  className={`input pl-10 ${errors.maxMembers ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="20"
                  defaultValue="20"
                />
              </div>
              {errors.maxMembers && (
                <p className="form-error flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.maxMembers.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang tạo phòng...
                  </div>
                ) : (
                  'Tạo phòng'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
