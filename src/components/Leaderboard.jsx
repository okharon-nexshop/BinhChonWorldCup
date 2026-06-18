import React, { useState } from 'react';
import { Trophy, ArrowLeft, Loader, Search, RefreshCw, X, Lock } from 'lucide-react';
import { getCountryEmoji } from './MatchList';

export default function Leaderboard({ currentUser, onFlagClick }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [poolBalance, setPoolBalance] = useState(0);
  const [totalFinished, setTotalFinished] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Không thể tải bảng xếp hạng');
      const data = await res.resData || await res.json();
      setUsers(data.leaderboard || []);
      setPoolBalance(data.poolBalance || 0);
      setTotalFinished(data.finishedCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user detailed predictions
  const fetchUserDetail = async (userId) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/leaderboard/user/${userId}`);
      if (!res.ok) throw new Error('Không thể tải chi tiết dự đoán');
      const data = await res.json();
      setUserDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserDetail(user.userId);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setUserDetail(null);
  };



  // Filter users based on search query
  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Trophy className="text-amber-400" size={24} />
          Bảng Xếp Hạng & Điểm Số
        </h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-grow sm:flex-grow-0">
            <span className="absolute left-3 top-2.5 text-gray-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-input pl-9 py-1.5 text-sm w-full sm:w-64"
              placeholder="Tìm tên thành viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
            onClick={fetchLeaderboard}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Tải lại
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-20 flex items-center justify-center">
          <Loader size={36} className="animate-spin text-emerald-400" />
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/20 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-2 sm:py-4 sm:px-6 text-center w-12 sm:w-16">Hạng</th>
                  <th className="py-3 px-2 sm:py-4 sm:px-6">Thành viên</th>
                  <th className="py-3 px-2 sm:py-4 sm:px-6 text-center">Điểm</th>
                  <th className="py-3 px-2 sm:py-4 sm:px-6 text-center hide-mobile">Tỷ số</th>
                  <th className="py-3 px-2 sm:py-4 sm:px-6 text-center">Đúng</th>
                  <th className="py-3 px-2 sm:py-4 sm:px-6 text-center">Sai</th>
                  <th className="py-3 px-2 sm:py-4 sm:px-6 text-center hide-xs">Bỏ lỡ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500 italic">
                      Không tìm thấy thành viên nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const isSelf = user.userId === currentUser.id;
                    let rankBadge = '';
                    let rankText = index + 1;

                    if (index === 0) {
                      rankBadge = '🥇';
                    } else if (index === 1) {
                      rankBadge = '🥈';
                    } else if (index === 2) {
                      rankBadge = '🥉';
                    }

                    return (
                      <tr
                        key={user.userId}
                        onClick={() => handleUserClick(user)}
                        className={`hover:bg-emerald-500/[0.02] cursor-pointer transition ${isSelf ? 'bg-emerald-500/[0.04] font-medium' : ''}`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-2 sm:py-4 sm:px-6 text-center font-bold">
                          {rankBadge ? <span className="text-base sm:text-xl">{rankBadge}</span> : rankText}
                        </td>
                        
                        {/* Name */}
                        <td className="py-3 px-2 sm:py-4 sm:px-6">
                          <div className="flex flex-col">
                            <span className={`text-gray-100 text-xs sm:text-sm ${isSelf ? 'text-emerald-400 font-semibold' : ''}`}>
                              {user.displayName} {isSelf && <span className="text-[10px] text-gray-500 font-normal sm:inline hidden">(Bạn)</span>}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-500">@{user.username}</span>
                          </div>
                        </td>

                        {/* Điểm */}
                        <td className="py-3 px-2 sm:py-4 sm:px-6 text-center text-cyan-400 font-bold font-mono text-xs sm:text-sm">
                          {user.balance >= 0 ? '+' : ''}{user.balance}
                        </td>

                        {/* Trúng tỷ số */}
                        <td className="py-3 px-2 sm:py-4 sm:px-6 text-center text-amber-400 font-bold font-mono text-xs sm:text-sm hide-mobile">
                          {user.correctScores}
                        </td>

                        {/* Đúng kết quả + tỷ số */}
                        <td className="py-3 px-2 sm:py-4 sm:px-6 text-center text-emerald-400 font-bold font-mono text-xs sm:text-sm">
                          {user.correctScores + user.correctOutcomes}
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-6 text-center text-red-400 font-bold font-mono text-xs sm:text-sm">
                          {user.wrongOutcomes}
                        </td>
                        <td className="py-3 px-2 sm:py-4 sm:px-6 text-center text-gray-500 font-bold font-mono text-xs sm:text-sm hide-xs">
                          {user.missed}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Prediction Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content glass-panel border-emerald-500/20 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-black/30">
              <div>
                <h3 className="text-lg font-bold text-gray-100">
                  Chi tiết bình chọn của {selectedUser.displayName}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Hiển thị lịch sử dự đoán giải đấu World Cup 2026
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary p-1.5 rounded-full"
                onClick={handleCloseModal}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {detailLoading ? (
                <div className="py-12 flex items-center justify-center">
                  <Loader size={28} className="animate-spin text-emerald-400" />
                </div>
              ) : userDetail ? (
                <div className="space-y-3">
                  {/* Summary Stats inside Modal */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-white/5 p-3 rounded-xl border border-white/5 text-xs">
                    <div>
                      <span className="text-gray-500 block">Điểm số</span>
                      <span className="font-bold text-cyan-400 font-mono">
                        {selectedUser.balance >= 0 ? '+' : ''}{selectedUser.balance}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Đoán đúng</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {selectedUser.correctScores + selectedUser.correctOutcomes}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Đoán sai</span>
                      <span className="font-bold text-red-400 font-mono">
                        {selectedUser.wrongOutcomes}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Bỏ lỡ</span>
                      <span className="font-bold text-gray-400 font-mono">
                        {selectedUser.missed}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 italic mt-1 text-center">
                    🔒 Dự đoán ở các trận sắp tới sẽ bị ẩn để đảm bảo tính công bằng cho đến khi bóng lăn.
                  </p>

                  <div className="h-px bg-white/5 my-2"></div>

                  {/* Prediction History List */}
                  <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                    {userDetail.matches.map(m => {
                      const hasVoted = m.prediction !== null;
                      
                      // Determine badge layout for prediction
                      let badgeText = '';
                      let badgeClass = '';
                      
                      if (m.scoreHome !== null && m.scoreAway !== null) {
                        if (m.result === 'exact' || m.result === 'outcome') {
                          badgeText = 'Đoán đúng';
                          badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                        } else if (m.result === 'missed') {
                          badgeText = 'Không dự đoán';
                          badgeClass = 'bg-red-500/10 text-red-400 border-red-500/10 border-dashed';
                        } else {
                          badgeText = 'Đoán sai';
                          badgeClass = 'bg-red-500/10 text-red-400 border-red-500/20';
                        }
                      } else if (m.isLocked) {
                        badgeText = 'Đang đá / Chờ';
                        badgeClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                      } else {
                        badgeText = 'Mở bình chọn';
                        badgeClass = 'bg-gray-500/10 text-gray-400 border-gray-500/10';
                      }

                      return (
                        <div key={m.id} className="flex justify-between items-center bg-black/20 p-3.5 rounded-xl border border-white/5 gap-4">
                          {/* Left: match info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              <span>{m.group}</span>
                              <span>•</span>
                              <span>{m.time} {m.date}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-sm font-semibold truncate flex items-center gap-1">
                                <span className="text-base">{getCountryEmoji(m.teamHome, onFlagClick)}</span>
                                {m.teamHome}
                              </span>
                              <span className="text-xs text-gray-500 font-bold">vs</span>
                              <span className="text-sm font-semibold truncate flex items-center gap-1">
                                <span className="text-base">{getCountryEmoji(m.teamAway, onFlagClick)}</span>
                                {m.teamAway}
                              </span>
                            </div>
                          </div>

                          {/* Center: score / prediction details */}
                          <div className="flex flex-col items-center flex-shrink-0 text-center min-w-[100px]">
                            {/* Actual Score */}
                            {m.scoreHome !== null ? (
                              <span className="text-sm font-bold text-gray-100 bg-white/5 px-2 py-0.5 rounded border border-white/5 font-mono">
                                KQ: {m.scoreHome} - {m.scoreAway}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-500 italic bg-white/5 px-1.5 py-0.5 rounded">
                                Chưa diễn ra
                              </span>
                            )}
                            
                            {/* Prediction details */}
                            <span className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-medium">
                              Đoán:{' '}
                              {hasVoted ? (
                                m.prediction.isMasked ? (
                                  <span className="text-gray-500 flex items-center gap-0.5 font-bold italic">
                                    <Lock size={10} /> Ẩn
                                  </span>
                                ) : (
                                  <span className="font-bold text-emerald-400 font-mono">
                                    {m.prediction.predictHome} - {m.prediction.predictAway}
                                  </span>
                                )
                              ) : (
                                <span className="text-gray-600 italic">bỏ lỡ</span>
                              )}
                            </span>
                          </div>

                          {/* Right: outcome status badge */}
                          <div className="flex-shrink-0 min-w-[85px] text-right">
                            <span className={`badge border text-[10px] py-1 px-2 ${badgeClass}`}>
                              {badgeText}
                            </span>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-center py-6 text-gray-500">
                  Không thể tải chi tiết bình chọn.
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t border-white/5 bg-black/30">
              <button
                type="button"
                className="btn btn-secondary py-2 px-4 text-xs"
                onClick={handleCloseModal}
              >
                Đóng lại
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
