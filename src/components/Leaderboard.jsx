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
  const [hoveredPoint, setHoveredPoint] = useState(null);

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
    setHoveredPoint(null);
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
                            <span className={`text-gray-100 text-xs sm:text-sm ${isSelf ? 'text-emerald-400 font-semibold' : ''} flex items-center gap-1.5 flex-wrap`}>
                              {user.displayName} {isSelf && <span className="text-[10px] text-gray-500 font-normal sm:inline hidden">(Bạn)</span>}
                              {user.badges && user.badges.map((badge, bIdx) => (
                                <span 
                                  key={bIdx} 
                                  className={`badge-item cursor-help text-[9px] px-1 py-0.2 rounded border bg-black/40 ${badge.type === 'champion' ? 'text-amber-400 border-amber-500/20' : badge.type === 'rebel' ? 'text-purple-400 border-purple-500/20' : badge.type === 'runner-up' ? 'text-gray-400 border-gray-400/20' : 'text-red-400 border-red-500/20'}`} 
                                  title={badge.desc}
                                >
                                  {badge.icon} {badge.label}
                                </span>
                              ))}
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

                  {/* Active badges list */}
                  {selectedUser.badges && selectedUser.badges.length > 0 && (
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-2">
                      <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        🏆 Danh hiệu đạt được
                      </h4>
                      <div className="flex flex-col gap-2">
                        {selectedUser.badges.map((badge, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 bg-black/30 p-2 rounded-lg border border-white/5">
                            <span className="text-lg shrink-0">{badge.icon}</span>
                            <div className="min-w-0">
                              <span className={`text-[11px] font-bold block ${badge.type === 'champion' ? 'text-amber-400' : badge.type === 'rebel' ? 'text-purple-400' : badge.type === 'runner-up' ? 'text-gray-400' : 'text-red-400'}`}>
                                {badge.label}
                              </span>
                              <span className="text-[9px] text-gray-500 block mt-0.5 leading-tight">{badge.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Native SVG Point Progression Line Chart */}
                  {(() => {
                    const finished = userDetail.matches
                      .filter(m => m.scoreHome !== null && m.scoreAway !== null)
                      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
                    
                    if (finished.length === 0) {
                      return (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center text-xs text-gray-500 italic">
                          📈 Chưa có trận đấu nào kết thúc để vẽ biểu đồ phong độ
                        </div>
                      );
                    }

                    let currentBalance = 0;
                    const dataPoints = finished.map((m, idx) => {
                      let delta = 0;
                      if (m.result === 'exact') delta = 100;
                      else if (m.result === 'outcome') delta = 0;
                      else if (m.result === 'wrong' || m.result === 'missed') delta = -100;
                      currentBalance += delta;
                      return {
                        matchIndex: idx + 1,
                        matchName: `${m.teamHome} vs ${m.teamAway}`,
                        result: m.result,
                        delta,
                        balance: currentBalance,
                        scoreText: `${m.scoreHome}-${m.scoreAway}`,
                        predText: m.prediction ? `${m.prediction.predictHome}-${m.prediction.predictAway}` : 'bỏ lỡ'
                      };
                    });

                    const chartPoints = [{ matchIndex: 0, matchName: 'Bắt đầu', balance: 0 }, ...dataPoints];
                    const width = 500;
                    const height = 160;
                    const paddingX = 40;
                    const paddingY = 20;

                    const balances = chartPoints.map(p => p.balance);
                    const minBalance = Math.min(...balances, 0);
                    const maxBalance = Math.max(...balances, 0);
                    const rangeY = maxBalance - minBalance;
                    const safeRangeY = rangeY === 0 ? 200 : rangeY * 1.25;
                    const midY = minBalance + rangeY / 2;
                    const minYAxis = midY - safeRangeY / 2;
                    const maxYAxis = midY + safeRangeY / 2;

                    const getX = (index) => {
                      if (chartPoints.length <= 1) return paddingX;
                      return paddingX + (index / (chartPoints.length - 1)) * (width - 2 * paddingX);
                    };

                    const getY = (val) => {
                      const range = maxYAxis - minYAxis;
                      if (range === 0) return height / 2;
                      return height - paddingY - ((val - minYAxis) / range) * (height - 2 * paddingY);
                    };

                    const firstX = getX(0);
                    const firstY = getY(0);
                    let linePath = `M ${firstX} ${firstY}`;
                    for (let i = 1; i < chartPoints.length; i++) {
                      linePath += ` L ${getX(i)} ${getY(chartPoints[i].balance)}`;
                    }

                    const lastX = getX(chartPoints.length - 1);
                    const bottomY = height - paddingY;
                    const areaPath = `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
                    const zeroY = getY(0);

                    const yLabels = Array.from(new Set([minBalance, 0, maxBalance])).sort((a, b) => a - b);

                    return (
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                        <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                          📈 Biểu đồ phong độ (Điểm tích lũy)
                        </h4>
                        
                        <div className="relative w-full overflow-hidden">
                          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" className="overflow-visible">
                            <defs>
                              <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                              </linearGradient>
                            </defs>

                            {/* Horizontal grid lines and labels */}
                            {yLabels.map((val, idx) => {
                              const y = getY(val);
                              return (
                                <g key={idx}>
                                  <line 
                                    x1={paddingX} 
                                    y1={y} 
                                    x2={width - paddingX} 
                                    y2={y} 
                                    stroke="rgba(255, 255, 255, 0.05)" 
                                    strokeWidth="1"
                                  />
                                  <text 
                                    x={paddingX - 8} 
                                    y={y + 3} 
                                    fill="#6b7280" 
                                    fontSize="8" 
                                    fontFamily="monospace"
                                    textAnchor="end"
                                  >
                                    {val >= 0 ? '+' : ''}{val}
                                  </text>
                                </g>
                              );
                            })}

                            {/* Intersecting zero point dotted line */}
                            <line 
                              x1={paddingX} 
                              y1={zeroY} 
                              x2={width - paddingX} 
                              y2={zeroY} 
                              stroke="rgba(255, 255, 255, 0.12)" 
                              strokeDasharray="3 3" 
                              strokeWidth="1"
                            />

                            {/* Area Gradient Fill */}
                            <path d={areaPath} fill="url(#chartAreaGradient)" />

                            {/* Line path */}
                            <path 
                              d={linePath} 
                              fill="none" 
                              stroke="#10b981" 
                              strokeWidth="2.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))' }}
                            />

                            {/* Interactive hover circle dots */}
                            {chartPoints.map((p, idx) => {
                              if (idx === 0) return null;
                              const x = getX(idx);
                              const y = getY(p.balance);
                              const isHovered = hoveredPoint && hoveredPoint.matchIndex === p.matchIndex;

                              return (
                                <g key={idx}>
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="8"
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredPoint(p)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                  />
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r={isHovered ? "4.5" : "3"}
                                    fill={p.delta > 0 ? "#10b981" : p.delta < 0 ? "#f43f5e" : "#6b7280"}
                                    stroke="#0b0f19"
                                    strokeWidth="1.5"
                                    className="pointer-events-none transition-all duration-150"
                                  />
                                </g>
                              );
                            })}

                            {/* SVG Tooltip */}
                            {hoveredPoint && (
                              <g pointerEvents="none">
                                <rect
                                  x={Math.max(10, Math.min(width - 170, getX(hoveredPoint.matchIndex) - 80))}
                                  y={Math.max(5, getY(hoveredPoint.balance) - 45)}
                                  width="160"
                                  height="36"
                                  rx="5"
                                  fill="rgba(15, 23, 42, 0.95)"
                                  stroke="rgba(16, 185, 129, 0.4)"
                                  strokeWidth="1"
                                />
                                <text
                                  x={Math.max(10, Math.min(width - 170, getX(hoveredPoint.matchIndex) - 80)) + 6}
                                  y={Math.max(5, getY(hoveredPoint.balance) - 45) + 14}
                                  fill="#f3f4f6"
                                  fontSize="8"
                                  fontWeight="bold"
                                >
                                  #{hoveredPoint.matchIndex}: {hoveredPoint.matchName}
                                </text>
                                <text
                                  x={Math.max(10, Math.min(width - 170, getX(hoveredPoint.matchIndex) - 80)) + 6}
                                  y={Math.max(5, getY(hoveredPoint.balance) - 45) + 26}
                                  fill="#9ca3af"
                                  fontSize="8"
                                >
                                  Đoán: {hoveredPoint.predText} | KQ: {hoveredPoint.scoreText} ({hoveredPoint.delta >= 0 ? '+' : ''}{hoveredPoint.delta})
                                </text>
                              </g>
                            )}
                          </svg>
                        </div>
                      </div>
                    );
                  })()}

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
