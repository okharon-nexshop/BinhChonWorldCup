import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Lock, User, Sparkles } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Google Sign-In states
  const [googleClientId, setGoogleClientId] = useState('');

  // Fetch Google client ID configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/auth/google/config');
        if (res.ok) {
          const data = await res.json();
          setGoogleClientId(data.clientId);
        }
      } catch (err) {
        console.error('Lỗi tải Google Client ID:', err);
      }
    };
    fetchConfig();
  }, []);

  // Initialize Google Sign-in button
  useEffect(() => {
    if (!googleClientId) return;

    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback,
        });

        const btnContainer = document.getElementById('google-btn');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_blue',
            size: 'large',
            width: btnContainer.clientWidth || 320,
            text: isRegister ? 'signup_with' : 'signin_with',
            shape: 'pill'
          });
        }
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
      return () => {
        const s = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (s && s.parentNode) s.parentNode.removeChild(s);
      };
    }
  }, [googleClientId, isRegister]);

  // Google authentication callback
  const handleGoogleCallback = async (response) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Xác thực tài khoản Google thất bại');
      }

      if (data.user) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password || (isRegister && !displayName)) {
      setError('Vui lòng nhập đầy đủ các trường thông tin');
      return;
    }

    setLoading(true);
    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister 
      ? { username, password, displayName }
      : { username, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* Split presentation grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10 animate-fade-in px-2 sm:px-4">
        
        {/* LEFT: Branding Visual Presentation */}
        <div className="hidden md:flex md:col-span-6 flex-col justify-center items-center text-center p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden w-full max-w-md mx-auto">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.06)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="w-full max-w-sm bg-white/95 p-4 md:p-5 rounded-2xl shadow-inner border border-white/20 mb-6 flex justify-center items-center relative z-10">
            <img 
              src="/worldcup2026_logo.jpg" 
              alt="World Cup 2026 Logo Banner" 
              className="max-h-24 md:max-h-32 max-w-full object-contain" 
            />
          </div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight glow-text text-green uppercase leading-tight">
              WORLD CUP 2026
            </h1>
            <h2 className="text-white text-xl font-bold tracking-wide mt-1">
              DỰ ĐOÁN FOR FUN
            </h2>
            
            <div className="flex justify-center gap-1.5 mt-4">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300 font-semibold uppercase tracking-wider">
                🇨🇦 Canada
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300 font-semibold uppercase tracking-wider">
                🇺🇸 Mỹ
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300 font-semibold uppercase tracking-wider">
                🇲🇽 Mexico
              </span>
            </div>
            
            <p className="text-xs text-gray-400 mt-5 max-w-xs leading-relaxed hidden md:block">
              🏆 Sân chơi giao lưu bình chọn và dự đoán tỷ số các trận đấu World Cup 2026 kịch tính dành riêng cho anh em nhóm. Thống kê tự động, kết quả minh bạch!
            </p>
          </div>
        </div>

        {/* RIGHT: Login/Register Credentials Card */}
        <div className="md:col-span-6 glass-panel p-6 md:p-8 w-full max-w-md mx-auto rounded-3xl border border-white/10 shadow-2xl">
          
          {/* Mobile-only logo header */}
          <div className="flex md:hidden flex-col items-center text-center mb-6 border-b border-white/5 pb-4">
            <div className="bg-white/95 p-3 rounded-2xl shadow-inner border border-white/20 mb-3 w-16 h-16 flex items-center justify-center">
              <img 
                src="/worldcup2026_logo.jpg" 
                alt="World Cup 2026 Logo" 
                className="max-h-12 object-contain" 
              />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight glow-text text-green uppercase leading-none">
              WORLD CUP 2026
            </h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">DỰ ĐOÁN FOR FUN</p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-1">
              {isRegister ? 'Tạo Tài Khoản' : 'Đăng Nhập'}
            </h3>
            <p className="text-xs text-gray-400">
              {isRegister 
                ? 'Nhập thông tin đăng ký để tham gia bình chọn cùng anh em' 
                : 'Nhập tài khoản hoặc sử dụng Gmail để tiếp tục'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  className="form-input w-full pl-10"
                  placeholder="Ví dụ: binhwc26"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Tên hiển thị (Tên thật)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-gray-500">
                    <Sparkles size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-input w-full pl-10"
                    placeholder="Ví dụ: Vũ Quyết Thắng"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  className="form-input w-full pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>



            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary mt-4 py-3"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></span>
              ) : isRegister ? (
                <>
                  <UserPlus size={18} /> Đăng Ký Tài Khoản
                </>
              ) : (
                <>
                  <LogIn size={18} /> Đăng Nhập
                </>
              )}
            </button>
          </form>

          {/* Google Sign-in divider & button */}
          {googleClientId && (
            <>
              <div className="or-divider">
                <span>Hoặc sử dụng</span>
              </div>
              <div className="w-full flex justify-center py-1">
                <div id="google-btn" className="w-full flex justify-center"></div>
              </div>
            </>
          )}

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-emerald-400 transition cursor-pointer"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
            >
              {isRegister 
                ? 'Đã có tài khoản? Đăng nhập ngay' 
                : 'Chưa có tài khoản? Đăng ký tại đây'}
            </button>
          </div>
        </div>

      </div>



    </div>
  );
}
