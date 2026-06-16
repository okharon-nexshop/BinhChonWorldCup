import React, { useState } from 'react';
import { LogIn, UserPlus, Lock, User, Sparkles } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password || (isRegister && (!displayName || !inviteCode))) {
      setError('Vui lòng nhập đầy đủ các trường thông tin');
      return;
    }

    setLoading(true);
    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister 
      ? { username, password, displayName, inviteCode }
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/worldcup2026_logo.jpg" 
              alt="World Cup 2026 Logo" 
              className="max-h-36 object-contain rounded-2xl shadow-xl border border-white/10" 
            />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight glow-text text-green uppercase leading-tight">
            WORLD CUP 2026<br/>
            <span className="text-white text-2xl">DỰ ĐOÁN FOR FUN</span>
          </h1>
          <div className="flex justify-center gap-1.5 mt-3">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-gray-400 font-semibold uppercase tracking-wider">
              🇨🇦 Canada
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-gray-400 font-semibold uppercase tracking-wider">
              🇺🇸 Mỹ
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-gray-400 font-semibold uppercase tracking-wider">
              🇲🇽 Mexico
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-3.5">
            Giải đấu dự đoán giao hữu nhóm 22-23 anh em
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Tên đăng nhập
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-gray-500">
                <User size={18} />
              </span>
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Ví dụ: binhwc26"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Tên hiển thị (Tên thật)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-500">
                  <Sparkles size={18} />
                </span>
                <input
                  type="text"
                  className="form-input pl-10"
                  placeholder="Ví dụ: Vũ Quyết Thắng"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-gray-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="form-input pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Mã mời tham gia nhóm
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-gray-500">
                  🔒
                </span>
                <input
                  type="text"
                  className="form-input pl-10"
                  placeholder="Nhập mã mời từ ban tổ chức"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                Mã này được chia sẻ trong nhóm Zalo của anh em.
              </p>
            </div>
          )}

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

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <button
            type="button"
            className="text-sm text-gray-400 hover:text-emerald-400 transition"
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
  );
}
