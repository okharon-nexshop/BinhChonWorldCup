import React, { useState } from 'react';
import { Shield, Key, Plus, Trash2, Edit2, Check, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { getCountryEmoji } from './MatchList';

export default function AdminPanel() {
  const [activeSubTab, setActiveSubTab] = useState('scores'); // 'scores', 'players', 'add_match'
  
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Add match form states
  const [group, setGroup] = useState('Vòng 1/16');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [teamHome, setTeamHome] = useState('');
  const [teamAway, setTeamAway] = useState('');

  // Edit states
  const [editingScoreId, setEditingScoreId] = useState(null);
  const [scoreHomeInput, setScoreHomeInput] = useState('');
  const [scoreAwayInput, setScoreAwayInput] = useState('');

  const [editingUserId, setEditingUserId] = useState(null);
  const [userDisplayNameInput, setUserDisplayNameInput] = useState('');
  const [userUsernameInput, setUserUsernameInput] = useState('');
  const [userRoleInput, setUserRoleInput] = useState('');
  const [userPasswordInput, setUserPasswordInput] = useState('');

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users and invite code
      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
        setInviteCode(usersData.inviteCode || '');
      }

      // Fetch matches (from general endpoint)
      const matchesRes = await fetch('/api/matches');
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setMatches(matchesData.matches || []);
      }
    } catch (err) {
      console.error(err);
      showMsg('Không thể tải dữ liệu quản trị', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // Update invite code
  const handleUpdateInviteCode = async () => {
    if (!inviteCode.trim()) return;
    try {
      const res = await fetch('/api/admin/invite-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showMsg('Cập nhật mã mời nhóm thành công!');
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  // Save actual match score
  const handleSaveScore = async (matchId) => {
    const isReset = scoreHomeInput === '' || scoreAwayInput === '';
    const body = isReset 
      ? { scoreHome: null, scoreAway: null }
      : { scoreHome: parseInt(scoreHomeInput, 10), scoreAway: parseInt(scoreAwayInput, 10) };

    try {
      const res = await fetch(`/api/admin/matches/${matchId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      showMsg('Cập nhật kết quả trận đấu thành công!');
      setEditingScoreId(null);
      fetchData(); // Reload rankings/matches
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  // Add new match
  const handleAddMatch = async (e) => {
    e.preventDefault();
    if (!group || !date || !time || !teamHome || !teamAway) {
      showMsg('Vui lòng nhập đầy đủ thông tin trận đấu', 'error');
      return;
    }

    // Validate DD/MM and HH:MM
    const dateRegex = /^\d{2}\/\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!dateRegex.test(date) || !timeRegex.test(time)) {
      showMsg('Định dạng Ngày (DD/MM) hoặc Giờ (HH:MM) không hợp lệ', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group, date, time, teamHome, teamAway }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showMsg('Đã tạo trận đấu mới thành công!');
      setDate('');
      setTime('');
      setTeamHome('');
      setTeamAway('');
      fetchData();
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  // Delete a match
  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Bạn có chắc chắn muốn XÓA trận đấu này? Tất cả bình chọn liên quan cũng sẽ bị xóa.')) return;
    try {
      const res = await fetch(`/api/admin/matches/${matchId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showMsg('Xóa trận đấu thành công');
      fetchData();
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  const handleUpdateUser = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          displayName: userDisplayNameInput, 
          role: userRoleInput,
          username: userUsernameInput,
          password: userPasswordInput
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      showMsg('Cập nhật thông tin thành viên thành công!');
      setUserPasswordInput('');
      setEditingUserId(null);
      fetchData();
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  // Reset user password
  const handleResetUserPassword = async (userId) => {
    if (!userPasswordInput || userPasswordInput.length < 6) {
      showMsg('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: userPasswordInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      showMsg('Đặt lại mật khẩu thành công!');
      setUserPasswordInput('');
      setEditingUserId(null);
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  // Delete a user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn XÓA thành viên này? Dữ liệu dự đoán liên quan sẽ mất hết.')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showMsg('Xóa thành viên thành công');
      fetchData();
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield className="text-amber-400" size={24} />
          Bảng Quản Trị Hệ Thống
        </h2>
        
        {/* Sub-tabs selector */}
        <div className="tabs-container w-full sm:w-auto">
          <button
            type="button"
            className={`tab-btn text-xs ${activeSubTab === 'scores' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('scores')}
          >
            Nhập kết quả trận đấu
          </button>
          <button
            type="button"
            className={`tab-btn text-xs ${activeSubTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('players')}
          >
            Thành viên & Mã mời
          </button>
          <button
            type="button"
            className={`tab-btn text-xs ${activeSubTab === 'add_match' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('add_match')}
          >
            Tạo trận đấu / Loại trực tiếp
          </button>
        </div>
      </div>

      {/* Notifications status messages */}
      {message.text && (
        <div className={`p-4 rounded-lg border text-sm font-semibold ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {message.text}
        </div>
      )}

      {/* TAB 1: ENTER SCORES */}
      {activeSubTab === 'scores' && (
        <div className="glass-panel p-6 space-y-4">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
            <h3 className="font-bold text-gray-200">Danh Sách Trận Đấu & Cập Nhật Tỷ Số</h3>
            <button
              type="button"
              className="btn btn-secondary py-1 px-3 text-xs flex items-center gap-1"
              onClick={fetchData}
            >
              <RefreshCw size={12} /> Tải lại lịch đấu
            </button>
          </div>

          <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
            {matches.map(m => {
              const isEditing = editingScoreId === m.id;
              
              return (
                <div key={m.id} className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-black/20 p-4 rounded-xl border border-white/5 gap-4">
                  {/* Left: match meta */}
                  <div className="flex-1">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 border border-white/5 uppercase">
                      {m.group}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-bold flex items-center gap-1 text-gray-100">
                        <span className="text-base">{getCountryEmoji(m.teamHome)}</span>
                        {m.teamHome}
                      </span>
                      <span className="text-xs text-gray-500 font-bold">vs</span>
                      <span className="text-sm font-bold flex items-center gap-1 text-gray-100">
                        <span className="text-base">{getCountryEmoji(m.teamAway)}</span>
                        {m.teamAway}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 font-medium">
                      Kickoff: {m.time} ({m.date})
                    </div>
                  </div>

                  {/* Center/Right: Score entry or display */}
                  <div className="flex items-center gap-3 justify-end">
                    {isEditing ? (
                      <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-emerald-500/20 animate-fade-in">
                        <input
                          type="number"
                          min="0"
                          className="form-input w-14 text-center py-1.5 px-1 font-bold text-base"
                          placeholder="Home"
                          value={scoreHomeInput}
                          onChange={(e) => setScoreHomeInput(e.target.value)}
                        />
                        <span className="text-gray-600 font-bold">-</span>
                        <input
                          type="number"
                          min="0"
                          className="form-input w-14 text-center py-1.5 px-1 font-bold text-base"
                          placeholder="Away"
                          value={scoreAwayInput}
                          onChange={(e) => setScoreAwayInput(e.target.value)}
                        />
                        
                        <div className="flex gap-1 pl-1">
                          <button
                            type="button"
                            className="btn btn-primary p-1.5 rounded-lg"
                            onClick={() => handleSaveScore(m.id)}
                            title="Lưu điểm"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary p-1.5 rounded-lg text-gray-400"
                            onClick={() => setEditingScoreId(null)}
                            title="Hủy bỏ"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {m.scoreHome !== null ? (
                            <span className="text-lg font-mono font-extrabold text-cyan-400 bg-cyan-950/20 px-3 py-1 rounded border border-cyan-500/20 glow-text-blue">
                              {m.scoreHome} - {m.scoreAway}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 italic bg-white/5 px-2.5 py-1 rounded">
                              Chưa có tỷ số
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                          onClick={() => {
                            setEditingScoreId(m.id);
                            setScoreHomeInput(m.scoreHome !== null ? String(m.scoreHome) : '');
                            setScoreAwayInput(m.scoreAway !== null ? String(m.scoreAway) : '');
                          }}
                        >
                          <Edit2 size={12} /> Cập nhật
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PLAYERS & INVITE CODE */}
      {activeSubTab === 'players' && (
        <div className="space-y-6">
          {/* Invite Code Setting */}
          <div className="glass-panel p-6">
            <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-1.5">
              <Key size={18} className="text-amber-400" /> Cấu hình Mã mời tham gia nhóm
            </h3>
            <div className="flex gap-3 max-w-md">
              <input
                type="text"
                className="form-input text-sm font-semibold uppercase tracking-wider"
                placeholder="Ví dụ: WORLDCUP2026"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary whitespace-nowrap"
                onClick={handleUpdateInviteCode}
              >
                Lưu Mã Mời
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Bất kỳ ai có mã này đều tự đăng ký tài khoản được. Hãy bảo mật mã này hoặc đổi nếu cần.
            </p>
          </div>

          {/* User management list */}
          <div className="glass-panel p-6">
            <h3 className="font-bold text-gray-200 mb-4">Danh Sách Thành Viên ({users.length})</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-black/20 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <th className="py-3 px-4">Tên hiển thị</th>
                    <th className="py-3 px-4">Tên đăng nhập</th>
                    <th className="py-3 px-4">Vai trò</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {users.map(u => {
                    const isEditing = editingUserId === u.id;
                    const isSystemAdmin = u.id === 'user_admin';

                    return (
                      <tr key={u.id} className="hover:bg-white/[0.01]">
                        {/* Display Name */}
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <input
                              type="text"
                              className="form-input py-1 text-sm max-w-[180px]"
                              value={userDisplayNameInput}
                              onChange={(e) => setUserDisplayNameInput(e.target.value)}
                            />
                          ) : (
                            <span className="font-medium text-gray-200">{u.displayName}</span>
                          )}
                        </td>

                        {/* Username */}
                        <td className="py-3.5 px-4 font-mono text-gray-400">
                          {isEditing ? (
                            <div className="flex items-center gap-0.5 max-w-[150px] bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                              <span className="text-gray-500 text-xs">@</span>
                              <input
                                type="text"
                                className="bg-transparent border-0 outline-none p-0 text-sm font-mono text-gray-200 w-full"
                                value={userUsernameInput}
                                onChange={(e) => setUserUsernameInput(e.target.value)}
                              />
                            </div>
                          ) : (
                            <span>@{u.username}</span>
                          )}
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <select
                              className="form-input py-1 text-xs max-w-[100px] bg-neutral-900 border-white/10"
                              value={userRoleInput}
                              onChange={(e) => setUserRoleInput(e.target.value)}
                              disabled={isSystemAdmin}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`badge text-[10px] ${u.role === 'admin' ? 'badge-live' : 'badge-finished'}`}>
                              {u.role}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          {isEditing ? (
                            <div className="flex gap-2 justify-end items-center">
                              {/* Change Password Block */}
                              <input
                                type="password"
                                className="form-input py-1 text-xs max-w-[120px]"
                                placeholder="Reset mật khẩu"
                                value={userPasswordInput}
                                onChange={(e) => setUserPasswordInput(e.target.value)}
                              />
                              {userPasswordInput && (
                                <button
                                  type="button"
                                  className="btn btn-secondary py-1 px-2 text-[10px] text-amber-400"
                                  onClick={() => handleResetUserPassword(u.id)}
                                >
                                  Đặt lại
                                </button>
                              )}

                              <button
                                type="button"
                                className="btn btn-primary p-1 rounded-lg"
                                onClick={() => handleUpdateUser(u.id)}
                              >
                                <Check size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary p-1 rounded-lg"
                                onClick={() => setEditingUserId(null)}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                className="btn btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
                                onClick={() => {
                                  setEditingUserId(u.id);
                                  setUserDisplayNameInput(u.displayName);
                                  setUserUsernameInput(u.username);
                                  setUserRoleInput(u.role);
                                  setUserPasswordInput('');
                                }}
                              >
                                Sửa
                              </button>
                              {!isSystemAdmin && (
                                <button
                                  type="button"
                                  className="btn btn-danger p-1 rounded"
                                  onClick={() => handleDeleteUser(u.id)}
                                  title="Xóa thành viên"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CREATE NEW MATCH */}
      {activeSubTab === 'add_match' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Match Form */}
          <div className="glass-panel p-6 lg:col-span-1 h-fit">
            <h3 className="font-bold text-gray-200 mb-4 flex items-center gap-1.5">
              <Plus size={18} className="text-emerald-400" /> Tạo trận đấu mới
            </h3>
            
            <form onSubmit={handleAddMatch} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase font-semibold">Vòng đấu / Bảng</label>
                <select
                  className="form-input text-sm bg-neutral-900"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                >
                  <option value="Vòng 1/16">Vòng 1/16 (Round of 32)</option>
                  <option value="Vòng 1/8">Vòng 1/8 (Round of 16)</option>
                  <option value="Tứ kết">Trận Tứ kết</option>
                  <option value="Bán kết">Trận Bán kết</option>
                  <option value="Tranh hạng 3">Tranh hạng Ba</option>
                  <option value="Chung kết">Trận Chung kết</option>
                  <option value="Bảng A">Bảng A</option>
                  <option value="Bảng B">Bảng B</option>
                  <option value="Bảng C">Bảng C</option>
                  <option value="Bảng D">Bảng D</option>
                  <option value="Bảng E">Bảng E</option>
                  <option value="Bảng F">Bảng F</option>
                  <option value="Bảng G">Bảng G</option>
                  <option value="Bảng H">Bảng H</option>
                  <option value="Bảng I">Bảng I</option>
                  <option value="Bảng J">Bảng J</option>
                  <option value="Bảng K">Bảng K</option>
                  <option value="Bảng L">Bảng L</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase font-semibold">Ngày thi đấu</label>
                  <input
                    type="text"
                    className="form-input text-sm"
                    placeholder="Ví dụ: 05/07"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                  <span className="text-[10px] text-gray-500">Định dạng DD/MM</span>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-2 uppercase font-semibold">Giờ thi đấu</label>
                  <input
                    type="text"
                    className="form-input text-sm"
                    placeholder="Ví dụ: 03:00"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                  <span className="text-[10px] text-gray-500">Định dạng HH:MM</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase font-semibold">Đội nhà (Home Team)</label>
                <input
                  type="text"
                  className="form-input text-sm"
                  placeholder="Ví dụ: Anh"
                  value={teamHome}
                  onChange={(e) => setTeamHome(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase font-semibold">Đội khách (Away Team)</label>
                <input
                  type="text"
                  className="form-input text-sm"
                  placeholder="Ví dụ: Croatia"
                  value={teamAway}
                  onChange={(e) => setTeamAway(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="w-full btn btn-primary py-2 text-xs">
                Tạo trận đấu
              </button>
            </form>
          </div>

          {/* Delete matches list */}
          <div className="glass-panel p-6 lg:col-span-2">
            <h3 className="font-bold text-gray-200 mb-4 flex items-center justify-between">
              <span>Danh Sách & Quản Lý Trận Đấu ({matches.length})</span>
              <span className="text-xs text-gray-500 font-normal">Hỗ trợ xóa các trận đấu tạo sai</span>
            </h3>

            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {matches.map(m => (
                <div key={m.id} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5 text-xs">
                  <div>
                    <span className="text-gray-500 font-mono">[{m.group}] </span>
                    <span className="font-bold text-gray-300">
                      {getCountryEmoji(m.teamHome)} {m.teamHome} vs {getCountryEmoji(m.teamAway)} {m.teamAway}
                    </span>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      📅 {m.time} ngày {m.date}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="btn btn-danger p-1.5 rounded"
                    onClick={() => handleDeleteMatch(m.id)}
                    title="Xóa trận đấu"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
