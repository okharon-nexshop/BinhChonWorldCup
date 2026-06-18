import React, { useState } from 'react';
import { Lock, Unlock, Calendar, Check, Save, HelpCircle, History, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

// Helper to resolve flag emojis for teams
export function getCountryEmoji(teamName) {
  const codeMap = {
    'Mexico': 'mx',
    'Nam Phi': 'za',
    'Hàn Quốc': 'kr',
    'Canada': 'ca',
    'Qatar': 'qa',
    'Thụy Sĩ': 'ch',
    'Brazil': 'br',
    'Morocco': 'ma',
    'Haiti': 'ht',
    'Scotland': 'gb-sct',
    'Mỹ': 'us',
    'Paraguay': 'py',
    'Úc': 'au',
    'Đức': 'de',
    'Ecuador': 'ec',
    'Bờ Biển Ngà': 'ci',
    'Curaçao': 'cw',
    'Hà Lan': 'nl',
    'Nhật Bản': 'jp',
    'Tunisia': 'tn',
    'Bỉ': 'be',
    'Ai Cập': 'eg',
    'Iran': 'ir',
    'New Zealand': 'nz',
    'Tây Ban Nha': 'es',
    'Cape Verde': 'cv',
    'Ả Rập Xê Út': 'sa',
    'Uruguay': 'uy',
    'Pháp': 'fr',
    'Senegal': 'sn',
    'Na Uy': 'no',
    'Argentina': 'ar',
    'Algeria': 'dz',
    'Áo': 'at',
    'Jordan': 'jo',
    'Bồ Đào Nha': 'pt',
    'Uzbekistan': 'uz',
    'Colombia': 'co',
    'Anh': 'gb-eng',
    'Croatia': 'hr',
    'Ghana': 'gh',
    'Panama': 'pa',
    'Cộng hòa Séc': 'cz',
    'Bosnia': 'ba',
    'Thổ Nhĩ Kỳ': 'tr',
    'Thụy Điển': 'se',
    'Iraq': 'iq',
    'CHDC Congo': 'cd'
  };

  const code = codeMap[teamName];
  if (!code) {
    return <span style={{ fontSize: '1.2em', verticalAlign: 'middle' }}>🏳️</span>;
  }

  return (
    <img 
      src={`https://flagcdn.com/${code}.svg`} 
      alt={`${teamName} flag`} 
      className="flag-img"
    />
  );
}

function MatchCard({ match, onSavePrediction, today, tomorrow }) {
  const { id, group, date, time, teamHome, teamAway, scoreHome, scoreAway, isLocked, prediction } = match;
  
  // Local state for goals, initialized with prediction values or empty string for easy typing
  const [predHome, setPredHome] = useState(prediction ? String(prediction.predictHome) : '');
  const [predAway, setPredAway] = useState(prediction ? String(prediction.predictAway) : '');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const hasVoted = prediction !== null;
  const isVoteOpen = (date === today || date === tomorrow) && !isLocked;

  const handleHomeChange = (e) => {
    if (!isVoteOpen) return;
    setPredHome(e.target.value);
    setDirty(true);
    setSuccess(false);
  };

  const handleAwayChange = (e) => {
    if (!isVoteOpen) return;
    setPredAway(e.target.value);
    setDirty(true);
    setSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isVoteOpen) return;
    if (predHome === '' || predAway === '') {
      alert('Vui lòng điền đầy đủ tỷ số dự đoán');
      return;
    }
    
    const hVal = parseInt(predHome, 10);
    const aVal = parseInt(predAway, 10);
    
    if (isNaN(hVal) || isNaN(aVal) || hVal < 0 || aVal < 0) {
      alert('Tỷ số dự đoán phải là số nguyên không âm');
      return;
    }

    setSaving(true);
    try {
      const ok = await onSavePrediction(id, hVal, aVal);
      if (ok) {
        setDirty(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Determine financial result if match finished
  let resultText = '';
  let resultClass = '';
  let isExact = false;

  if (scoreHome !== null && scoreAway !== null) {
    if (hasVoted) {
      isExact = prediction.predictHome === scoreHome && prediction.predictAway === scoreAway;
      const predOutcome = prediction.predictHome > prediction.predictAway ? 'home' : (prediction.predictHome === prediction.predictAway ? 'draw' : 'away');
      const actOutcome = scoreHome > scoreAway ? 'home' : (scoreHome === scoreAway ? 'draw' : 'away');

      if (isExact) {
        resultText = 'Đoán đúng';
        resultClass = 'text-amber-400 font-semibold border-amber-500/20 bg-amber-500/5 glow-text';
      } else if (predOutcome === actOutcome) {
        resultText = 'Đoán đúng';
        resultClass = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      } else {
        resultText = 'Đoán sai';
        resultClass = 'text-red-400 border-red-500/20 bg-red-500/5';
      }
    } else {
      resultText = 'Không dự đoán';
      resultClass = 'text-red-400 border-red-500/10 bg-red-500/5 border-dashed';
    }
  }

  // Trigger confetti if exact score loaded
  React.useEffect(() => {
    if (isExact && scoreHome !== null) {
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.8 }
      });
    }
  }, [isExact]);

  return (
    <div className={`match-card ${isLocked ? 'opacity-90' : ''}`}>
      
      {/* 1. TOP ROW: TIME / DATE (Thời gian - Ngày to lên & Bảng đấu) */}
      <div className="match-card-header-centered">
        <span className="text-base font-bold text-emerald-400 glow-text font-mono">
          📅 {date} • {time}
        </span>
        <span className="badge badge-scheduled text-[9px] py-0.5 px-2 bg-white/5 border border-white/5 text-gray-400 font-semibold mt-1">
          {group}
        </span>
      </div>

      {/* 2. MIDDLE ROW: 2 CỜ 2 ĐỘI VS NHAU CHUNG 1 DÒNG */}
      <div className="match-card-middle">
        {/* Row of Flags with VS/Score */}
        <div className="match-card-flags">
          <span className="flag-inline flex-shrink-0">{getCountryEmoji(teamHome)}</span>
          
          {scoreHome !== null && scoreAway !== null ? (
            <span className="text-lg font-black bg-cyan-950/20 text-cyan-400 px-3 py-1 rounded-xl border border-cyan-500/20 glow-text-blue font-mono">
              {scoreHome} - {scoreAway}
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-500 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
              VS
            </span>
          )}
          
          <span className="flag-inline flex-shrink-0">{getCountryEmoji(teamAway)}</span>
        </div>
        
        {/* Row of Team Names */}
        <div className="match-card-teams">
          {teamHome} — {teamAway}
        </div>
      </div>

      {/* Divider */}
      <div className="match-card-divider"></div>

      {/* 3. BOTTOM ROW: TỶ SỐ CHUNG 1 DÒNG LUÔN, CHO TYPE VÀO */}
      <div>
        {isLocked ? (
          // Locked view: Centered
          <div className="flex flex-col items-center justify-center gap-1.5 text-center text-xs">
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-500 flex items-center gap-1">
                <Lock size={10} /> Bạn đoán:
              </span>
              {hasVoted ? (
                <span className="font-bold text-gray-200 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {prediction.predictHome} - {prediction.predictAway}
                </span>
              ) : (
                <span className="text-gray-600 italic">Không đoán</span>
              )}
            </div>
            {resultText && (
              <span className={`badge border text-[9px] py-0.5 px-2 mt-1.5 ${resultClass}`}>
                {resultText}
              </span>
            )}
          </div>
        ) : hasVoted ? (
          // Voted, not locked yet: read-only
          <div className="flex flex-col items-center justify-center gap-1.5 text-center text-xs">
            <div className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check size={12} /> Đã dự đoán:
              </span>
              <span className="font-extrabold text-emerald-300 font-mono bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">
                {prediction.predictHome} - {prediction.predictAway}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-normal italic mt-0.5">
              🔒 Đã lưu (không thể sửa đổi)
            </span>
          </div>
        ) : isVoteOpen ? (
          // Open voting: Centered prediction form
          <form onSubmit={handleSave} className="match-card-prediction-form">
            <div className="match-card-prediction-inputs">
              <span className="match-card-prediction-label">Dự đoán:</span>
              <input
                type="number"
                min="0"
                className="score-type-input"
                placeholder="0"
                value={predHome}
                onChange={handleHomeChange}
                required
              />
              <span className="text-gray-500 font-extrabold">:</span>
              <input
                type="number"
                min="0"
                className="score-type-input"
                placeholder="0"
                value={predAway}
                onChange={handleAwayChange}
                required
              />
              
              <button
                type="submit"
                disabled={saving || !dirty}
                className={`btn py-1.5 px-3.5 text-xs rounded-lg ${dirty ? 'btn-primary' : 'btn-secondary'}`}
              >
                {saving ? (
                  <span className="animate-spin rounded-full h-3 w-3 border-b border-current"></span>
                ) : success ? (
                  <Check size={12} className="text-black" />
                ) : (
                  <Save size={12} />
                )}
              </button>
            </div>
          </form>
        ) : (
          // Future match: locked voting
          <div className="flex flex-col items-center justify-center text-xs text-gray-500 bg-white/5 p-2 rounded-lg border border-white/5 gap-1">
            <span className="flex items-center justify-center gap-1 font-medium text-gray-400">
              <Lock size={10} /> Chưa mở bình chọn
            </span>
            <span className="text-[10px] text-gray-500 font-normal italic">
              Bình chọn mở vào ngày {date}
            </span>
          </div>
        )}
      </div>

    </div>
  );
}

export default function MatchList({ matches, onSavePrediction }) {
  // Compute today's date formatted as DD/MM in GMT+7
  const today = (() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  })();

  // Compute tomorrow's date formatted as DD/MM in GMT+7
  const tomorrow = (() => {
    const now = new Date();
    const tmr = new Date(now);
    tmr.setDate(now.getDate() + 1);
    const day = String(tmr.getDate()).padStart(2, '0');
    const month = String(tmr.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  })();

  const [filter, setFilter] = useState('open_voting'); // Default is 'open_voting'!

  // Filter matches:
  // - 'open_voting': Matches of today OR tomorrow that are NOT locked.
  // - 'played': All matches that are locked or finished.
  // - 'upcoming': Matches scheduled for days after tomorrow.
  const filteredMatches = matches.filter(m => {
    if (filter === 'open_voting') {
      return (m.date === today || m.date === tomorrow) && !m.isLocked;
    }
    if (filter === 'played') {
      return m.isLocked || m.scoreHome !== null;
    }
    if (filter === 'upcoming') {
      return m.date !== today && m.date !== tomorrow && !m.isLocked;
    }
    return true;
  });

  // Group filtered matches by Date
  const groupedMatches = {};
  filteredMatches.forEach(m => {
    if (!groupedMatches[m.date]) {
      groupedMatches[m.date] = [];
    }
    groupedMatches[m.date].push(m);
  });

  // Sort dates:
  // - If viewing 'played': Sort dates DESCENDING (newest results first)
  // - Else: Sort dates ASCENDING (chronological)
  const sortedDates = Object.keys(groupedMatches).sort((a, b) => {
    const timeA = new Date(groupedMatches[a][0].datetime);
    const timeB = new Date(groupedMatches[b][0].datetime);
    return filter === 'played' ? timeB - timeA : timeA - timeB;
  });

  // Helper text if empty
  const getEmptyMessage = () => {
    if (filter === 'open_voting') {
      return `Hiện tại không có trận đấu nào đang mở bình chọn cho ngày hôm nay (${today}) & ngày mai (${tomorrow}). Hãy chọn tab 'Trận đã đá / Lịch sử' để xem kết quả!`;
    }
    if (filter === 'played') {
      return 'Chưa có trận đấu nào diễn ra hoặc kết thúc.';
    }
    if (filter === 'upcoming') {
      return 'Không có trận đấu sắp tới nào được lên lịch.';
    }
    return 'Không có trận đấu nào.';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Live TV Streaming Info Alert Box */}
      <div className="glass-panel border border-red-500/25 bg-red-500/5 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 animate-pulse text-base">
            📺
          </div>
          <div className="text-left">
            <p className="font-bold text-white leading-tight">Link Xem Trực Tiếp VTVGo</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Truy cập kênh truyền hình trực tuyến để theo dõi các trận đấu World Cup kịch tính.</p>
          </div>
        </div>
        <a
          href="https://vtvgo.vn/channel"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary bg-red-600 border-red-500 text-black hover:bg-red-500 px-4 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
        >
          <span>Xem Ngay</span> 🔴
        </a>
      </div>
      {/* Filters/Tabs bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Calendar className="text-emerald-400" size={20} />
          Bình Chọn Trận Đấu
        </h2>
        
        <div className="tabs-container w-full sm:w-auto">
          <button
            type="button"
            className={`tab-btn text-xs ${filter === 'open_voting' ? 'active' : ''}`}
            onClick={() => setFilter('open_voting')}
          >
            <Clock size={13} /> Đang mở ({today} & {tomorrow})
          </button>
          <button
            type="button"
            className={`tab-btn text-xs ${filter === 'played' ? 'active' : ''}`}
            onClick={() => setFilter('played')}
          >
            <History size={13} /> Trận đã đá / Lịch sử
          </button>
          <button
            type="button"
            className={`tab-btn text-xs ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            <Calendar size={13} /> Trận sắp tới
          </button>
        </div>
      </div>

      {/* Matches List Grouped by Date */}
      {sortedDates.length === 0 ? (
        <div className="glass-panel p-12 text-center text-gray-400 max-w-3xl mx-auto border-dashed">
          <HelpCircle size={40} className="mx-auto text-gray-600 mb-3" />
          <p className="text-sm font-medium leading-relaxed">{getEmptyMessage()}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(dateStr => {
            const matchesInDay = groupedMatches[dateStr];
            
            return (
              <div key={dateStr} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-px bg-emerald-500/10 flex-grow"></div>
                  <h3 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    📅 Ngày {dateStr} {dateStr === today ? '(Hôm nay)' : dateStr === tomorrow ? '(Ngày mai)' : ''}
                  </h3>
                  <div className="h-px bg-emerald-500/10 flex-grow"></div>
                </div>

                <div className="matches-grid">
                  {matchesInDay.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onSavePrediction={onSavePrediction}
                      today={today}
                      tomorrow={tomorrow}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
