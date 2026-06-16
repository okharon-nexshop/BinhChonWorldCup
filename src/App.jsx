import React, { useState, useEffect } from 'react';
import { LogOut, Calendar, Trophy, Shield, HelpCircle, Loader, User } from 'lucide-react';
import Login from './components/Login';
import MatchList from './components/MatchList';
import Leaderboard from './components/Leaderboard';
import Rules from './components/Rules';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches'); // 'matches', 'leaderboard', 'rules', 'admin'
  
  const [matches, setMatches] = useState([]);
  const [poolBalance, setPoolBalance] = useState(0);
  const [finishedCount, setFinishedCount] = useState(0);
  const [userStats, setUserStats] = useState({ correct: 0, wrong: 0, missed: 0 });
  const [dataLoading, setDataLoading] = useState(false);

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
            missed: currentUserStats.missed
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
      <header className="glass-panel border-x-0 border-t-0 rounded-none border-b border-white/5 py-4 px-6 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Title */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg shadow-inner">
              ⚽
            </div>
            <div className="text-left">
              <h1 className="text-sm font-extrabold tracking-tight text-white uppercase whitespace-nowrap">
                WC 2026 <span className="text-[9px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 inline-block align-middle ml-1">FOR FUN</span>
              </h1>
              <p className="text-[9px] text-gray-500 font-medium">Canada • Mỹ • Mexico</p>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="tabs-container flex-shrink-0">
            <button
              type="button"
              className={`tab-btn text-xs ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('matches')}
            >
              <Calendar size={14} /> Bình Chọn
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

          {/* User details & logout */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* User card info */}
            <div className="flex items-center gap-2.5 bg-black/30 py-1.5 px-3 rounded-xl border border-white/5 text-xs">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <User size={14} />
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-200 leading-tight">{user.displayName}</div>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
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
              className="btn btn-secondary p-2.5 rounded-xl hover:text-red-400 flex-shrink-0"
              onClick={handleLogout}
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>

        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-grow py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Centered Logo Banner & Title */}
          <div className="glass-panel brand-banner-container">
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

          {activeTab === 'matches' && (
            <MatchList 
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

    </div>
  );
}
