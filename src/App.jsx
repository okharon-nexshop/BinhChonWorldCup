import React, { useState, useEffect } from 'react';
import { LogOut, Calendar, Trophy, Shield, HelpCircle, Loader, User, X, Settings, GitFork } from 'lucide-react';
import Login from './components/Login';
import MatchList from './components/MatchList';
import Leaderboard from './components/Leaderboard';
import Rules from './components/Rules';
import AdminPanel from './components/AdminPanel';
import TournamentBracket from './components/TournamentBracket';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches'); // 'matches', 'leaderboard', 'rules', 'admin'
  
  const [matches, setMatches] = useState([]);
  const [poolBalance, setPoolBalance] = useState(0);
  const [finishedCount, setFinishedCount] = useState(0);
  const [userStats, setUserStats] = useState({ correct: 0, wrong: 0, missed: 0, balance: 0 });
  const [dataLoading, setDataLoading] = useState(false);

  // Profile modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDisplayName, setProfileDisplayName] = useState('');
  const [profileOldPassword, setProfileOldPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [congratulations, setCongratulations] = useState(null);

  // Check auth status
  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch core matches & balance data
  const fetchCoreData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      // Fetch matches with predictions
      const matchesRes = await fetch('/api/matches');
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatches(matchesData.matches || []);
        setCongratulations(matchesData.congratulations || null);
      }

      // Fetch leaderboard to compute pool balance and current user balance
      const leaderboardRes = await fetch('/api/leaderboard');
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setPoolBalance(leaderboardData.poolBalance || 0);
        setFinishedCount(leaderboardData.finishedCount || 0);
        
        // Find current user's stats
        const currentUserStats = leaderboardData.leaderboard.find(u => u.userId === user.id);
        if (currentUserStats) {
          setUserStats({
            correct: currentUserStats.correctScores + currentUserStats.correctOutcomes,
            wrong: currentUserStats.wrongOutcomes,
            missed: currentUserStats.missed,
            balance: currentUserStats.balance
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCoreData();
      const intervalId = setInterval(fetchCoreData, 30000); // Poll every 30 seconds
      return () => clearInterval(intervalId);
    }
  }, [user]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        setMatches([]);
        setUserStats({ correct: 0, wrong: 0, missed: 0 });
        setActiveTab('matches');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    setProfileSaving(true);

    try {
      let displayNameUpdated = false;
      let passwordUpdated = false;
      let errors = [];

      // 1. Update Display Name if changed
      if (profileDisplayName.trim() !== user.displayName) {
        const res = await fetch('/api/auth/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName: profileDisplayName }),
        });
        const data = await res.json();
        if (res.ok) {
          displayNameUpdated = true;
          setUser(prev => ({ ...prev, displayName: data.user.displayName }));
        } else {
          errors.push(data.message || 'Lỗi cập nhật tên hiển thị');
        }
      }

      // 2. Update Password if fields are filled
      if (profileOldPassword || profileNewPassword) {
        if (!profileOldPassword || !profileNewPassword) {
          errors.push('Vui lòng nhập cả mật khẩu cũ và mới để đổi mật khẩu');
        } else if (profileNewPassword.length < 6) {
          errors.push('Mật khẩu mới phải từ 6 ký tự trở lên');
        } else {
          const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPassword: profileOldPassword, newPassword: profileNewPassword }),
          });
          const data = await res.json();
          if (res.ok) {
            passwordUpdated = true;
            setProfileOldPassword('');
            setProfileNewPassword('');
          } else {
            errors.push(data.message || 'Lỗi đổi mật khẩu');
          }
        }
      }

      if (errors.length > 0) {
        setProfileMsg({ text: errors.join('. '), type: 'error' });
      } else if (displayNameUpdated || passwordUpdated) {
        let msg = 'Cập nhật thành công';
        if (displayNameUpdated && passwordUpdated) {
          msg = 'Cập nhật tên hiển thị và đổi mật khẩu thành công';
        } else if (displayNameUpdated) {
          msg = 'Cập nhật tên hiển thị thành công';
        } else if (passwordUpdated) {
          msg = 'Đổi mật khẩu thành công';
        }
        setProfileMsg({ text: msg, type: 'success' });
        setTimeout(() => {
          setShowProfileModal(false);
        }, 1500);
      } else {
        setProfileMsg({ text: 'Không có thông tin nào thay đổi', type: 'info' });
      }
    } catch (err) {
      console.error(err);
      setProfileMsg({ text: 'Không thể kết nối đến máy chủ', type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Callback to save prediction from card
  const handleSavePrediction = async (matchId, predictHome, predictAway) => {
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, predictHome, predictAway }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Lưu thất bại');
        return false;
      }
      
      // Update predictions locally
      setMatches(prev => prev.map(m => {
        if (m.id === matchId) {
          return {
            ...m,
            prediction: { predictHome, predictAway }
          };
        }
        return m;
      }));
      
      // Refresh balance and rankings
      fetchCoreData();
      return true;
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến máy chủ');
      return false;
    }
  };



  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070c09] text-emerald-400">
        <Loader size={48} className="animate-spin mb-4" />
        <span className="text-sm font-semibold tracking-wide uppercase">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* HEADER SECTION */}
      <header className="glass-panel border-x-0 border-t-0 rounded-none border-b border-white/5 py-3 px-4 sm:px-6 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center w-full gap-2 sm:gap-4">
          
          {/* Logo Title */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-base shadow-inner">
              ⚽
            </div>
            <div className="text-left">
              <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-white uppercase whitespace-nowrap flex items-center gap-1">
                WC 2026 <span className="text-[8px] text-emerald-400 font-semibold px-1 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20 inline-block">FOR FUN</span>
              </h1>
              <p className="text-[8px] text-gray-500 font-medium hidden sm:block">Canada • Mỹ • Mexico</p>
            </div>
          </div>

          {/* Navigation tabs (hidden on mobile, shown on desktop) */}
          <nav className="tabs-container hidden md:flex flex-shrink-0">
            <button
              type="button"
              className={`tab-btn text-xs ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('matches')}
            >
              <Calendar size={14} /> Bình Chọn
            </button>
            <button
              type="button"
              className={`tab-btn text-xs ${activeTab === 'bracket' ? 'active' : ''}`}
              onClick={() => setActiveTab('bracket')}
            >
              <GitFork size={14} /> Sơ Đồ Giải
            </button>
            <button
              type="button"
              className={`tab-btn text-xs ${activeTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <Trophy size={14} /> Xếp Hạng
            </button>
            <button
              type="button"
              className={`tab-btn text-xs ${activeTab === 'rules' ? 'active' : ''}`}
              onClick={() => setActiveTab('rules')}
            >
              <HelpCircle size={14} /> Luật Chơi
            </button>
            {user.role === 'admin' && (
              <button
                type="button"
                className={`tab-btn text-xs ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                <Shield size={14} /> Quản Trị
              </button>
            )}
          </nav>

          {/* User details, live link & logout */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Live stream links */}
            <div className="flex items-center gap-1 sm:gap-2">
              <a
                href="https://vtvgo.vn/channel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 py-1 px-1.5 sm:px-2.5 rounded-lg bg-red-600/10 border border-red-500/20 text-red-400 text-[9px] sm:text-[11px] font-bold hover:bg-red-600/20 hover:border-red-500/40 transition-all"
                title="Xem VTVGo"
              >
                VTV
              </a>
              <a
                href="https://tieulamlive.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 py-1 px-1.5 sm:px-2.5 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-400 text-[9px] sm:text-[11px] font-bold hover:bg-purple-600/20 hover:border-purple-500/40 transition-all animate-pulse"
                title="Xem Tiếu Lâm Live"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping inline-block" />
                Tiếu Lâm
              </a>
            </div>

            {/* User card info */}
            <div 
              onClick={() => {
                setProfileDisplayName(user.displayName);
                setProfileOldPassword('');
                setProfileNewPassword('');
                setProfileMsg({ text: '', type: '' });
                setShowProfileModal(true);
              }}
              className="flex items-center gap-2 bg-black/30 py-1 px-1 sm:py-1.5 sm:px-3 rounded-xl border border-white/5 text-xs cursor-pointer hover:bg-white/5 hover:border-emerald-500/30 transition-all duration-200 group"
              title="Cài đặt tài khoản"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                <Settings size={14} />
              </div>
              <div className="hidden md:block text-left">
                <div className="font-bold text-gray-200 leading-tight flex items-center gap-1">
                  {user.displayName}
                  <span className="text-[9px] text-gray-500 font-normal opacity-0 group-hover:opacity-100 transition-opacity">(Cài đặt)</span>
                </div>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <span className="text-[9px] text-cyan-400 font-extrabold bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded font-mono">
                    Điểm: {userStats.balance >= 0 ? '+' : ''}{userStats.balance}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded font-mono">
                    Đúng: {userStats.correct}
                  </span>
                  <span className="text-[9px] text-red-400 font-extrabold bg-red-500/10 border border-red-500/15 px-1.5 py-0.5 rounded font-mono">
                    Sai: {userStats.wrong}
                  </span>
                  <span className="text-[9px] text-gray-400 font-extrabold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono" title="Không dự đoán (Coi như sai)">
                    Bỏ lỡ: {userStats.missed}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              type="button"
              className="btn btn-secondary p-2 sm:p-2.5 rounded-xl hover:text-red-400 flex-shrink-0"
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <LogOut size={15} />
            </button>
          </div>

        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-grow py-4 sm:py-8 px-2 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Centered Logo Banner & Title (hidden on mobile) */}
          <div className="glass-panel brand-banner-container hidden md:block">
            {/* Soft radial background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.06)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="brand-banner-flex">
              <img 
                src="/worldcup2026_logo.jpg" 
                alt="FIFA World Cup 2026 Logo Banner" 
                className="brand-banner-img"
              />
              <div className="brand-banner-text">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight glow-text text-green uppercase leading-none">
                  WORLD CUP 2026
                </h2>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide mt-1">
                  DỰ ĐOÁN FOR FUN
                </h3>
                <div className="flex justify-center sm:justify-start gap-1.5 mt-2.5">
                  <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-gray-400 font-medium">🇨🇦 Canada</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-gray-400 font-medium">🇺🇸 Mỹ</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-gray-400 font-medium">🇲🇽 Mexico</span>
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'matches' && congratulations && (
            <div className="glass-panel relative border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 p-4 sm:p-5 overflow-hidden rounded-2xl animate-fade-in shadow-lg mb-6">
              {/* Soft gold glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.04)_0%,transparent_70%)] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between relative z-10">
                <div className="text-center md:text-left flex-grow">
                  <h3 className="text-sm font-extrabold tracking-wider text-amber-400 flex items-center justify-center md:justify-start gap-1.5 uppercase">
                    🏆 Bảng Vàng Tiên Tri (Ngày {congratulations.recentDate})
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Chúc mừng anh em đã dự đoán chính xác kết quả các trận đấu gần nhất:{" "}
                    <span className="text-gray-300 font-semibold">
                      {congratulations.matches.map(m => `${m.teamHome} ${m.scoreHome}-${m.scoreAway} ${m.teamAway}`).join(', ')}
                    </span>
                  </p>
                  
                  {/* Winners list */}
                  <div className="mt-3 space-y-2">
                    {congratulations.exactWinners.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs">
                        <span className="font-bold text-amber-300 flex items-center gap-1 min-w-[90px] shrink-0">
                          👑 Vua Tiên Tri:
                        </span>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                          {congratulations.exactWinners.map((w, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 font-medium font-mono text-[11px]"
                              title={`Đoán đúng tỷ số ${w.predictionText} trận ${w.matchName}`}
                            >
                              @{w.username} ({w.displayName})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {congratulations.outcomeWinners.length > 0 && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs">
                        <span className="font-bold text-emerald-400 flex items-center gap-1 min-w-[90px] shrink-0">
                          ⭐ Thần Đoán:
                        </span>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                          {congratulations.outcomeWinners.map((w, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-emerald-300 text-[11px]"
                              title={`Đoán đúng kết quả trận ${w.matchName}`}
                            >
                              @{w.username} ({w.displayName})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {congratulations.exactWinners.length === 0 && congratulations.outcomeWinners.length === 0 && (
                      <p className="text-[11px] text-gray-500 italic">Hôm đó không có ai đoán trúng kết quả trận nào.</p>
                    )}
                  </div>
                </div>

                {/* Decorative trophy icon */}
                <div className="hidden md:flex w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 items-center justify-center text-xl text-amber-400 shrink-0 shadow-inner">
                  👑
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <MatchList 
              matches={matches} 
              onSavePrediction={handleSavePrediction} 
            />
          )}

          {activeTab === 'bracket' && (
            <TournamentBracket 
              matches={matches} 
              onSavePrediction={handleSavePrediction} 
            />
          )}

          {activeTab === 'leaderboard' && (
            <Leaderboard currentUser={user} />
          )}

          {activeTab === 'rules' && (
            <Rules 
              poolBalance={poolBalance} 
              finishedCount={finishedCount} 
              totalCount={matches.length} 
            />
          )}

          {activeTab === 'admin' && user.role === 'admin' && (
            <AdminPanel />
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-6 px-4 border-t border-white/5 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Copyright © 2026 Okharon. All rights reserved.</span>
          <span className="flex items-center gap-1 text-[10px] text-gray-600">
            Hệ thống tự động thống kê kết quả bình chọn theo trận đấu thực tế
          </span>
        </div>
      </footer>

      {/* PROFILE SETTINGS MODAL */}
      {showProfileModal && (
        <div className="modal-backdrop z-[999]" onClick={() => setShowProfileModal(false)}>
          <div 
            className="glass-panel w-full max-w-md p-6 relative shadow-2xl border border-white/10 rounded-2xl bg-[#0c1410]/95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="mb-5 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                <Settings size={18} />
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold text-white leading-tight">Cài Đặt Tài Khoản</h3>
                <p className="text-xs text-gray-400">@{user.username}</p>
              </div>
            </div>

            {/* Message Alert */}
            {profileMsg.text && (
              <div className={`mb-4 p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                profileMsg.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : profileMsg.type === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-white/5 border-white/10 text-gray-300'
              }`}>
                <span>{profileMsg.type === 'success' ? '✅' : profileMsg.type === 'error' ? '⚠️' : 'ℹ️'}</span>
                <span>{profileMsg.text}</span>
              </div>
            )}

            {/* User stats card (visible on mobile / desktop inside modal) */}
            <div className="mb-4 bg-black/40 p-3.5 rounded-xl border border-white/5 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Thống Kê Bình Chọn của Bạn</span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-cyan-500/10 border border-cyan-500/20 py-2 rounded-lg">
                  <div className="text-cyan-400 font-extrabold text-sm font-mono">{userStats.balance >= 0 ? '+' : ''}{userStats.balance}</div>
                  <div className="text-[9px] text-cyan-500 font-bold uppercase mt-0.5">Điểm số</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-lg">
                  <div className="text-emerald-400 font-extrabold text-sm font-mono">{userStats.correct}</div>
                  <div className="text-[9px] text-emerald-500 font-bold uppercase mt-0.5">Đoán Đúng</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 py-2 rounded-lg">
                  <div className="text-red-400 font-extrabold text-sm font-mono">{userStats.wrong}</div>
                  <div className="text-[9px] text-red-500 font-bold uppercase mt-0.5">Đoán Sai</div>
                </div>
                <div className="bg-white/5 border border-white/10 py-2 rounded-lg">
                  <div className="text-gray-300 font-extrabold text-sm font-mono">{userStats.missed}</div>
                  <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Bỏ Lỡ</div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Tên hiển thị (Tên thật)
                </label>
                <input
                  type="text"
                  className="form-input w-full"
                  placeholder="Ví dụ: Vũ Quyết Thắng"
                  value={profileDisplayName}
                  onChange={(e) => setProfileDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="pt-3 border-t border-white/5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 text-emerald-400">Đổi mật khẩu</h4>
                <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
                  Để trống nếu không muốn đổi mật khẩu. Nếu đổi mật khẩu, vui lòng nhập cả mật khẩu cũ và mới.
                </p>
                
                {/* Old Password */}
                <div className="mb-3">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    className="form-input w-full text-xs py-2"
                    placeholder="••••••••"
                    value={profileOldPassword}
                    onChange={(e) => setProfileOldPassword(e.target.value)}
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Mật khẩu mới (Tối thiểu 6 ký tự)
                  </label>
                  <input
                    type="password"
                    className="form-input w-full text-xs py-2"
                    placeholder="••••••••"
                    value={profileNewPassword}
                    onChange={(e) => setProfileNewPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="w-1/3 btn btn-secondary py-2.5 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-2/3 btn btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {profileSaving ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {user && (
        <nav className="mobile-bottom-nav md:hidden">
          <button
            type="button"
            className={`mobile-bottom-nav-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <Calendar size={18} />
            <span>Bình Chọn</span>
          </button>
          <button
            type="button"
            className={`mobile-bottom-nav-btn ${activeTab === 'bracket' ? 'active' : ''}`}
            onClick={() => setActiveTab('bracket')}
          >
            <GitFork size={18} />
            <span>Sơ Đồ Giải</span>
          </button>
          <button
            type="button"
            className={`mobile-bottom-nav-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            <Trophy size={18} />
            <span>Xếp Hạng</span>
          </button>
          <button
            type="button"
            className={`mobile-bottom-nav-btn ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <HelpCircle size={18} />
            <span>Luật Chơi</span>
          </button>
          {user.role === 'admin' && (
            <button
              type="button"
              className={`mobile-bottom-nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <Shield size={18} />
              <span>Quản Trị</span>
            </button>
          )}
        </nav>
      )}

    </div>
  );
}
