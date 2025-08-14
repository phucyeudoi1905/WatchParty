import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await registerUser(data);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { label: 'Ít nhất 6 ký tự', met: password && password.length >= 6 },
    { label: 'Có chữ hoa', met: password && /[A-Z]/.test(password) },
    { label: 'Có chữ thường', met: password && /[a-z]/.test(password) },
    { label: 'Có số', met: password && /\d/.test(password) }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Tạo tài khoản mới
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Hoặc{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            đăng nhập vào tài khoản hiện có
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Tên người dùng
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  {...register('username', {
                    required: 'Tên người dùng là bắt buộc',
                    minLength: {
                      value: 3,
                      message: 'Tên người dùng phải có ít nhất 3 ký tự'
                    },
                    maxLength: {
                      value: 30,
                      message: 'Tên người dùng không được quá 30 ký tự'
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'
                    }
                  })}
                  className={`input pl-10 ${
                    errors.username ? 'border-red-300 focus:ring-red-500' : ''
                  }`}
                  placeholder="Nhập tên người dùng"
                />
              </div>
              {errors.username && (
                <p className="form-error flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email là bắt buộc',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email không hợp lệ'
                    }
                  })}
                  className={`input pl-10 ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : ''
                  }`}
                  placeholder="Nhập email của bạn"
                />
              </div>
              {errors.email && (
                <p className="form-error flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Mật khẩu là bắt buộc',
                    minLength: {
                      value: 6,
                      message: 'Mật khẩu phải có ít nhất 6 ký tự'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
                    }
                  })}
                  className={`input pl-10 pr-10 ${
                    errors.password ? 'border-red-300 focus:ring-red-500' : ''
                  }`}
                  placeholder="Nhập mật khẩu"
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
              
              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center text-sm">
                    {req.met ? (
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2" />
                    )}
                    <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>

              {errors.password && (
                <p className="form-error flex items-center mt-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Xác nhận mật khẩu là bắt buộc',
                    validate: value => value === password || 'Mật khẩu không khớp'
                  })}
                  className={`input pl-10 pr-10 ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''
                  }`}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                {...register('terms', {
                  required: 'Bạn phải đồng ý với điều khoản sử dụng'
                })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                Tôi đồng ý với{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  điều khoản sử dụng
                </a>{' '}
                và{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500">
                  chính sách bảo mật
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="form-error flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.terms.message}
              </p>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang tạo tài khoản...
                  </div>
                ) : (
                  'Tạo tài khoản'
                )}
              </button>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
