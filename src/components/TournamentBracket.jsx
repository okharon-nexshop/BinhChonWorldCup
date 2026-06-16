import React, { useState } from 'react';
import { Lock, Unlock, Calendar, Trophy, X, Save, Check, ShieldAlert } from 'lucide-react';
import { getCountryEmoji } from './MatchList';

// Helper to format placeholder team names into friendly Vietnamese
function getFriendlyTeamName(teamName) {
  if (!teamName) return 'Chưa rõ';
  if (teamName.startsWith('W') && !isNaN(teamName.substring(1))) {
    return `Thắng Trận ${teamName.substring(1)}`;
  }
  if (teamName.startsWith('L') && !isNaN(teamName.substring(1))) {
    return `Thua Trận ${teamName.substring(1)}`;
  }
  if (/^[123][A-L]/.test(teamName)) {
    const rank = teamName[0] === '1' ? 'Nhất' : (teamName[0] === '2' ? 'Nhì' : 'Hạng 3');
    const groupName = teamName.substring(1);
    return `${rank} Bảng ${groupName}`;
  }
  return teamName;
}

// Check if a team is a placeholder
function isPlaceholder(teamName) {
  if (!teamName) return true;
  return teamName.startsWith('W') || teamName.startsWith('L') || /^[123][A-L]/.test(teamName);
}

// Individual Match Node in the Bracket
function MatchNode({ match, onClick, today, tomorrow }) {
  const { id, num, group, date, time, teamHome, teamAway, scoreHome, scoreAway, isLocked, prediction } = match;

  const hasVoted = prediction !== null;
  const isVoteOpen = (date === today || date === tomorrow) && !isLocked;

  // Determine result classes if played
  let statusBadge = null;
  let borderClass = '';

  if (scoreHome !== null && scoreAway !== null) {
    if (hasVoted) {
      const isExact = prediction.predictHome === scoreHome && prediction.predictAway === scoreAway;
      const predOutcome = prediction.predictHome > prediction.predictAway ? 'home' : (prediction.predictHome === prediction.predictAway ? 'draw' : 'away');
      const actOutcome = scoreHome > scoreAway ? 'home' : (scoreHome === scoreAway ? 'draw' : 'away');

      if (isExact) {
        statusBadge = <span className="text-amber-400 font-extrabold text-[9px] bg-amber-500/10 border border-amber-500/20 px-1 py-0.2 rounded" title="Đoán trúng tỷ số">👑 +3đ</span>;
        borderClass = 'border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
      } else if (predOutcome === actOutcome) {
        statusBadge = <span className="text-emerald-400 font-bold text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded" title="Đoán trúng kết quả">⭐ +1đ</span>;
        borderClass = 'border-emerald-500/30';
      } else {
        statusBadge = <span className="text-red-400 font-semibold text-[9px] bg-red-500/10 border border-red-500/20 px-1 py-0.2 rounded" title="Đoán sai">❌ 0đ</span>;
        borderClass = 'border-red-500/20';
      }
    } else {
      statusBadge = <span className="text-gray-500 text-[9px] bg-white/5 border border-white/10 px-1 py-0.2 rounded">Bỏ lỡ</span>;
    }
  } else if (isVoteOpen) {
    statusBadge = <span className="text-emerald-400 font-bold text-[8px] uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded animate-pulse">Bình Chọn</span>;
  } else if (hasVoted) {
    statusBadge = <span className="text-emerald-400 text-[9px] bg-emerald-950/20 border border-emerald-500/10 px-1 py-0.2 rounded">Đã đoán ({prediction.predictHome}-{prediction.predictAway})</span>;
  }

  // Determine winner bolding
  const homeWinner = scoreHome !== null && scoreAway !== null && scoreHome > scoreAway;
  const awayWinner = scoreHome !== null && scoreAway !== null && scoreAway > scoreHome;

  return (
    <div 
      onClick={() => onClick(match)}
      className={`match-node ${borderClass} ${isVoteOpen ? 'is-open-vote' : ''}`}
    >
      {/* Node Header */}
      <div className="flex justify-between items-center text-[9px] text-gray-500 mb-1.5 border-b border-white/5 pb-1">
        <span className="font-bold font-mono text-gray-400">#TRẬN {num}</span>
        <span className="flex items-center gap-1">
          <Calendar size={8} /> {date} {time}
        </span>
      </div>

      {/* Team Home */}
      <div className={`match-node-team ${homeWinner ? 'winner' : scoreHome !== null ? 'loser' : ''}`}>
        <div className="match-node-team-info">
          <span>{getCountryEmoji(teamHome)}</span>
          <span className="truncate max-w-[120px]">{getFriendlyTeamName(teamHome)}</span>
        </div>
        <span className="match-node-score">
          {scoreHome !== null ? scoreHome : (prediction ? <span className="text-[10px] text-emerald-500 font-mono">({prediction.predictHome})</span> : '-')}
        </span>
      </div>

      {/* Team Away */}
      <div className={`match-node-team ${awayWinner ? 'winner' : scoreAway !== null ? 'loser' : ''}`}>
        <div className="match-node-team-info">
          <span>{getCountryEmoji(teamAway)}</span>
          <span className="truncate max-w-[120px]">{getFriendlyTeamName(teamAway)}</span>
        </div>
        <span className="match-node-score">
          {scoreAway !== null ? scoreAway : (prediction ? <span className="text-[10px] text-emerald-500 font-mono">({prediction.predictAway})</span> : '-')}
        </span>
      </div>

      {/* Result badge footer if any */}
      {statusBadge && (
        <div className="mt-1.5 flex justify-end gap-1.5 border-t border-white/5 pt-1">
          {statusBadge}
        </div>
      )}
    </div>
  );
}

// Dynamic standings calculator for a group
function getGroupStandings(groupMatches) {
  const standings = {};

  // Initialize teams from match list
  groupMatches.forEach(m => {
    if (m.teamHome && !standings[m.teamHome]) {
      standings[m.teamHome] = { name: m.teamHome, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    }
    if (m.teamAway && !standings[m.teamAway]) {
      standings[m.teamAway] = { name: m.teamAway, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    }
  });

  // Calculate results from finished matches
  groupMatches.forEach(m => {
    if (m.scoreHome !== null && m.scoreAway !== null) {
      const home = standings[m.teamHome];
      const away = standings[m.teamAway];
      if (home && away) {
        home.played += 1;
        away.played += 1;
        home.gf += m.scoreHome;
        home.ga += m.scoreAway;
        away.gf += m.scoreAway;
        away.ga += m.scoreHome;

        if (m.scoreHome > m.scoreAway) {
          home.win += 1;
          home.pts += 3;
          away.loss += 1;
        } else if (m.scoreHome < m.scoreAway) {
          away.win += 1;
          away.pts += 3;
          home.loss += 1;
        } else {
          home.draw += 1;
          home.pts += 1;
          away.draw += 1;
          away.pts += 1;
        }
      }
    }
  });

  // Compute goal difference (GD)
  Object.values(standings).forEach(t => {
    t.gd = t.gf - t.ga;
  });

  // Sort by pts desc, gd desc, gf desc, alphabetically asc
  return Object.values(standings).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });
}

// Main Tournament Bracket Component
export default function TournamentBracket({ matches, onSavePrediction }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeMobileTab, setActiveMobileTab] = useState('r32'); // 'r32', 'r16', 'qf', 'sf', 'final'
  const [bracketMode, setBracketMode] = useState('group'); // 'group' or 'knockout'
  const [selectedGroup, setSelectedGroup] = useState('Bảng A');

  const groupsList = [
    'Bảng A', 'Bảng B', 'Bảng C', 'Bảng D', 'Bảng E', 'Bảng F',
    'Bảng G', 'Bảng H', 'Bảng I', 'Bảng J', 'Bảng K', 'Bảng L'
  ];

  // Input states for prediction modal
  const [predHome, setPredHome] = useState('');
  const [predAway, setPredAway] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Compute today & tomorrow in GMT+7 for open voting checks
  const today = (() => {
    const now = new Date();
    const gmt7Time = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const day = String(gmt7Time.getUTCDate()).padStart(2, '0');
    const month = String(gmt7Time.getUTCMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  })();

  const tomorrow = (() => {
    const now = new Date();
    const tmr = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
    const day = String(tmr.getUTCDate()).padStart(2, '0');
    const month = String(tmr.getUTCMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  })();

  const getMatch = (id) => matches.find(m => m.id === id);

  // Group mappings
  const leftR32Ids = ['match_73', 'match_75', 'match_74', 'match_77', 'match_83', 'match_84', 'match_81', 'match_82'];
  const leftR16Ids = ['match_90', 'match_89', 'match_93', 'match_94'];
  const leftQFIds = ['match_97', 'match_98'];
  const leftSFIds = ['match_101'];

  const rightR32Ids = ['match_76', 'match_78', 'match_79', 'match_80', 'match_86', 'match_88', 'match_85', 'match_87'];
  const rightR16Ids = ['match_91', 'match_92', 'match_95', 'match_96'];
  const rightQFIds = ['match_99', 'match_100'];
  const rightSFIds = ['match_102'];

  const finalId = 'match_104';
  const thirdPlaceId = 'match_103';

  // Gather matches safely
  const leftR32 = leftR32Ids.map(getMatch).filter(Boolean);
  const leftR16 = leftR16Ids.map(getMatch).filter(Boolean);
  const leftQF = leftQFIds.map(getMatch).filter(Boolean);
  const leftSF = leftSFIds.map(getMatch).filter(Boolean);

  const rightR32 = rightR32Ids.map(getMatch).filter(Boolean);
  const rightR16 = rightR16Ids.map(getMatch).filter(Boolean);
  const rightQF = rightQFIds.map(getMatch).filter(Boolean);
  const rightSF = rightSFIds.map(getMatch).filter(Boolean);

  const finalMatch = getMatch(finalId);
  const thirdPlaceMatch = getMatch(thirdPlaceId);

  // Find champion if final finished
  let champion = null;
  if (finalMatch && finalMatch.scoreHome !== null && finalMatch.scoreAway !== null) {
    champion = finalMatch.scoreHome > finalMatch.scoreAway ? finalMatch.teamHome : finalMatch.teamAway;
  }

  // Active group data
  const activeGroupMatches = matches.filter(m => m.group === selectedGroup);
  const activeGroupStandings = getGroupStandings(activeGroupMatches);

  // Open prediction modal
  const handleNodeClick = (match) => {
    setSelectedMatch(match);
    setErrorMsg('');
    if (match.prediction) {
      setPredHome(String(match.prediction.predictHome));
      setPredAway(String(match.prediction.predictAway));
    } else {
      setPredHome('');
      setPredAway('');
    }
  };

  // Submit prediction from modal
  const handleSavePrediction = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;
    setErrorMsg('');

    const isVoteOpen = (selectedMatch.date === today || selectedMatch.date === tomorrow) && !selectedMatch.isLocked;
    if (!isVoteOpen) {
      setErrorMsg('Bình chọn trận này hiện đang đóng.');
      return;
    }

    if (predHome === '' || predAway === '') {
      setErrorMsg('Vui lòng nhập đầy đủ tỷ số.');
      return;
    }

    const hVal = parseInt(predHome, 10);
    const aVal = parseInt(predAway, 10);

    if (isNaN(hVal) || isNaN(aVal) || hVal < 0 || aVal < 0) {
      setErrorMsg('Tỷ số phải là số nguyên không âm.');
      return;
    }

    setSaving(true);
    try {
      const ok = await onSavePrediction(selectedMatch.id, hVal, aVal);
      if (ok) {
        // Refresh local selected match details to update visual states
        setSelectedMatch(prev => ({
          ...prev,
          prediction: { predictHome: hVal, predictAway: aVal }
        }));
        setTimeout(() => setSelectedMatch(null), 800);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Không thể lưu bình chọn. Lỗi máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="text-center sm:text-left flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            🏆 Sơ Đồ & Tiến Trình Giải Đấu
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Bình chọn trực tiếp bằng cách nhấn vào các trận đang mở. Tự động cập nhật theo tỷ số thực tế.
          </p>
        </div>
      </div>

      {/* Mode Switcher Tab */}
      <div className="flex justify-center sm:justify-start">
        <div className="inline-flex p-1 bg-black/40 rounded-xl border border-white/5">
          <button
            type="button"
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              bracketMode === 'group'
                ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setBracketMode('group')}
          >
            Vòng Bảng (Group Stage)
          </button>
          <button
            type="button"
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              bracketMode === 'knockout'
                ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setBracketMode('knockout')}
          >
            Vòng Loại Trực Tiếp (Knockout)
          </button>
        </div>
      </div>

      {bracketMode === 'group' ? (
        /* GROUP STAGE VIEW */
        <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
          {/* Group Tab Bar */}
          <div className="flex overflow-x-auto gap-1.5 pb-2 scrollbar-premium">
            {groupsList.map(g => (
              <button
                key={g}
                type="button"
                className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg border transition-all whitespace-nowrap ${
                  selectedGroup === g
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                }`}
                onClick={() => setSelectedGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Standings Table */}
            <div className="lg:col-span-5">
              <div className="glass-panel border border-white/5 p-4 rounded-2xl bg-[#08130e]/40 space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    📊 Bảng Xếp Hạng - {selectedGroup}
                  </h3>
                  <span className="text-[9px] text-gray-500 italic">Thực tế</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 font-mono font-bold uppercase tracking-wider text-[9px]">
                        <th className="py-2 px-1 text-center w-8">#</th>
                        <th className="py-2 px-1">Đội</th>
                        <th className="py-2 px-1 text-center w-8" title="Số trận đã đấu">Tr</th>
                        <th className="py-2 px-1 text-center w-6" title="Thắng">T</th>
                        <th className="py-2 px-1 text-center w-6" title="Hòa">H</th>
                        <th className="py-2 px-1 text-center w-6" title="Thua">B</th>
                        <th className="py-2 px-1 text-center w-8" title="Hiệu số">HS</th>
                        <th className="py-2 px-1 text-center w-10 text-emerald-400" title="Điểm">Điểm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeGroupStandings.map((team, idx) => {
                        let rowBg = 'border-white/5';
                        let rankBg = 'bg-white/5 text-gray-400';
                        if (idx < 2) {
                          rowBg = 'border-emerald-500/10 bg-emerald-500/2';
                          rankBg = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                        } else if (idx === 2) {
                          rowBg = 'border-blue-500/10 bg-blue-500/2';
                          rankBg = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                        } else {
                          rowBg = 'border-red-500/5 opacity-70';
                          rankBg = 'bg-red-500/10 text-red-400 border border-red-500/20';
                        }

                        return (
                          <tr key={team.name} className={`border-b ${rowBg} hover:bg-white/5 transition-colors`}>
                            <td className="py-2.5 px-1 text-center font-bold font-mono">
                              <span className={`w-4 h-4 rounded-full inline-flex items-center justify-center text-[9px] ${rankBg}`}>
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-2.5 px-1 font-semibold text-white flex items-center gap-1 whitespace-nowrap">
                              <span className="text-sm">{getCountryEmoji(team.name)}</span>
                              <span className="truncate max-w-[100px]">{team.name}</span>
                            </td>
                            <td className="py-2.5 px-1 text-center font-bold font-mono text-gray-300">{team.played}</td>
                            <td className="py-2.5 px-1 text-center font-semibold font-mono text-gray-500">{team.win}</td>
                            <td className="py-2.5 px-1 text-center font-semibold font-mono text-gray-500">{team.draw}</td>
                            <td className="py-2.5 px-1 text-center font-semibold font-mono text-gray-500">{team.loss}</td>
                            <td className={`py-2.5 px-1 text-center font-bold font-mono ${team.gd > 0 ? 'text-emerald-400' : team.gd < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                              {team.gd > 0 ? `+${team.gd}` : team.gd}
                            </td>
                            <td className="py-2.5 px-1 text-center font-black font-mono text-emerald-400 text-xs">{team.pts}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-1 text-[9px] text-gray-500 border-t border-white/5 pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-emerald-500/20 border border-emerald-500/30 inline-block" />
                    <span>Top 2: Vé vào thẳng Vòng 32</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-blue-500/20 border border-blue-500/30 inline-block" />
                    <span>Hạng 3: Xét 8 đội tốt nhất trong 12 bảng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Group Matches */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 pl-2">
                ⚽ Lịch Thi Đấu & Bình Chọn ({selectedGroup})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
                {activeGroupMatches.map(m => (
                  <MatchNode 
                    key={m.id} 
                    match={m} 
                    onClick={handleNodeClick} 
                    today={today} 
                    tomorrow={tomorrow} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* KNOCKOUT BRACKET VIEW */
        <>
          {/* DESKTOP VIEW (hidden on mobile, block on md+) */}
          <div className="hidden md:block overflow-x-auto pb-6 scrollbar-premium glass-panel border border-white/5 p-4 rounded-2xl bg-[#08130e]/40">
            <div className="min-w-[1300px] flex items-center justify-between gap-6 py-4 relative">
              
              {/* LEFT SIDE BRACKET TREE */}
              <div className="flex gap-6 items-stretch h-[820px] select-none">
                {/* Round of 32 */}
                <div className="flex flex-col justify-around h-full">
                  <div className="bracket-round-header">Vòng 32</div>
                  <div className="flex-grow flex flex-col justify-around">
                    {leftR32.map(m => (
                      <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                    ))}
                  </div>
                </div>

                {/* Round of 16 */}
                <div className="flex flex-col justify-around h-full">
                  <div className="bracket-round-header">Vòng 16</div>
                  <div className="flex-grow flex flex-col justify-around">
                    {leftR16.map(m => (
                      <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                    ))}
                  </div>
                </div>

                {/* Quarter-finals */}
                <div className="flex flex-col justify-around h-full">
                  <div className="bracket-round-header">Tứ Kết</div>
                  <div className="flex-grow flex flex-col justify-around">
                    {leftQF.map(m => (
                      <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                    ))}
                  </div>
                </div>

                {/* Semi-final */}
                <div className="flex flex-col justify-around h-full">
                  <div className="bracket-round-header">Bán Kết</div>
                  <div className="flex-grow flex flex-col justify-around">
                    {leftSF.map(m => (
                      <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                    ))}
                  </div>
                </div>
              </div>

              {/* CENTER PANEL (Finals, Trophy, Champion) */}
              <div className="flex flex-col justify-center items-center w-[280px] gap-8 text-center h-[820px] shrink-0">
                
                {/* Glowing Champion box */}
                <div className="glass-panel p-5 border border-amber-500/25 bg-amber-500/5 rounded-2xl w-full flex flex-col items-center gap-3 relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.05)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_75%)] pointer-events-none" />
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shadow-inner">
                    🏆
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase block">Nhà Vô Địch</span>
                    {champion ? (
                      <div className="text-lg font-black text-white flex items-center justify-center gap-1.5 mt-1 animate-pulse">
                        {getCountryEmoji(champion)} {champion}
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-gray-500 italic mt-1">Chưa Xác Định</div>
                    )}
                  </div>
                </div>

                {/* Final Match Node */}
                <div className="w-full">
                  <div className="bracket-round-header border-amber-500/10 text-amber-400">Chung Kết</div>
                  {finalMatch && (
                    <MatchNode match={finalMatch} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                  )}
                </div>

                {/* Third Place Match Node */}
                <div className="w-full">
                  <div className="bracket-round-header">Tranh Hạng Ba</div>
                  {thirdPlaceMatch && (
                    <MatchNode match={thirdPlaceMatch} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                  )}
                </div>

              </div>

              {/* RIGHT SIDE BRACKET TREE */}
              <div className="flex gap-6 items-stretch h-[820px] select-none">
                {/* Semi-final */}
                <div className="flex flex-col justify-around h-full">
                  <div className="bracket-round-header">Bán Kết</div>
                  <div className="flex-grow flex flex-col justify-around">
                    {rightSF.map(m => (
                      <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                    ))}
                  </div>
                </div>

                {/* Quarter-finals */}
                <div className="flex flex-col justify-around h-full">
                  <div className="bracket-round-header">Tứ Kết</div>
                  <div className="flex-grow flex flex-col justify-around">
                    {rightQF.map(m => (
                      <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                    ))}
                  </div>
                </div>

                {/* Round of 16 */}
                <div className="flex flex-col justify-around h-full">
                  <div className="bracket-round-header">Vòng 16</div>
                  <div className="flex-grow flex flex-col justify-around">
                    {rightR16.map(m => (
                      <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                    ))}
                  </div>
                </div>

                {/* Round of 32 */}
                <div className="flex flex-col justify-around h-full">
                  <div className="bracket-round-header">Vòng 32</div>
                  <div className="flex-grow flex flex-col justify-around">
                    {rightR32.map(m => (
                      <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* MOBILE VIEW (block on mobile, hidden on md+) */}
          <div className="block md:hidden">
            {/* Horizontal scroll subnav for rounds */}
            <nav className="bracket-subnav">
              <button 
                type="button"
                className={`bracket-subnav-btn ${activeMobileTab === 'r32' ? 'active' : ''}`}
                onClick={() => setActiveMobileTab('r32')}
              >
                Vòng 32
              </button>
              <button 
                type="button"
                className={`bracket-subnav-btn ${activeMobileTab === 'r16' ? 'active' : ''}`}
                onClick={() => setActiveMobileTab('r16')}
              >
                Vòng 16
              </button>
              <button 
                type="button"
                className={`bracket-subnav-btn ${activeMobileTab === 'qf' ? 'active' : ''}`}
                onClick={() => setActiveMobileTab('qf')}
              >
                Tứ Kết
              </button>
              <button 
                type="button"
                className={`bracket-subnav-btn ${activeMobileTab === 'sf' ? 'active' : ''}`}
                onClick={() => setActiveMobileTab('sf')}
              >
                Bán Kết
              </button>
              <button 
                type="button"
                className={`bracket-subnav-btn ${activeMobileTab === 'final' ? 'active' : ''}`}
                onClick={() => setActiveMobileTab('final')}
              >
                Chung Kết
              </button>
            </nav>

            {/* Display filtered matches list for selected round */}
            <div className="space-y-3 flex flex-col items-center">
              {activeMobileTab === 'r32' && (
                <>
                  <div className="text-[10px] text-gray-500 font-extrabold uppercase mb-1.5 self-start">Nhánh Trái:</div>
                  {leftR32.map(m => (
                    <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                  ))}
                  <div className="text-[10px] text-gray-500 font-extrabold uppercase mt-3 mb-1.5 self-start">Nhánh Phải:</div>
                  {rightR32.map(m => (
                    <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                  ))}
                </>
              )}

              {activeMobileTab === 'r16' && (
                <>
                  <div className="text-[10px] text-gray-500 font-extrabold uppercase mb-1.5 self-start">Nhánh Trái:</div>
                  {leftR16.map(m => (
                    <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                  ))}
                  <div className="text-[10px] text-gray-500 font-extrabold uppercase mt-3 mb-1.5 self-start">Nhánh Phải:</div>
                  {rightR16.map(m => (
                    <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                  ))}
                </>
              )}

              {activeMobileTab === 'qf' && (
                <>
                  <div className="text-[10px] text-gray-500 font-extrabold uppercase mb-1.5 self-start">Nhánh Trái:</div>
                  {leftQF.map(m => (
                    <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                  ))}
                  <div className="text-[10px] text-gray-500 font-extrabold uppercase mt-3 mb-1.5 self-start">Nhánh Phải:</div>
                  {rightQF.map(m => (
                    <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                  ))}
                </>
              )}

              {activeMobileTab === 'sf' && (
                <>
                  <div className="text-[10px] text-gray-500 font-extrabold uppercase mb-1.5 self-start">Trận 1 (Nhánh Trái):</div>
                  {leftSF.map(m => (
                    <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                  ))}
                  <div className="text-[10px] text-gray-500 font-extrabold uppercase mt-3 mb-1.5 self-start">Trận 2 (Nhánh Phải):</div>
                  {rightSF.map(m => (
                    <MatchNode key={m.id} match={m} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                  ))}
                </>
              )}

              {activeMobileTab === 'final' && (
                <div className="space-y-4 w-full flex flex-col items-center">
                  {/* Mobile Champion Card */}
                  <div className="glass-panel p-4 border border-amber-500/25 bg-amber-500/5 rounded-2xl w-full max-w-[220px] flex flex-col items-center gap-2 shadow-inner">
                    <span className="text-[9px] text-amber-400 font-extrabold tracking-widest uppercase">Nhà Vô Địch 🏆</span>
                    {champion ? (
                      <div className="text-sm font-black text-white flex items-center gap-1 mt-0.5">
                        {getCountryEmoji(champion)} {champion}
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-gray-500 italic">Chưa Xác Định</div>
                    )}
                  </div>

                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="text-[10px] text-amber-400 font-extrabold uppercase self-start pl-2">Chung Kết:</div>
                    {finalMatch && (
                      <MatchNode match={finalMatch} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                    )}

                    <div className="text-[10px] text-gray-500 font-extrabold uppercase self-start pl-2 mt-2">Tranh Hạng Ba:</div>
                    {thirdPlaceMatch && (
                      <MatchNode match={thirdPlaceMatch} onClick={handleNodeClick} today={today} tomorrow={tomorrow} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* QUICK PREDICTION MODAL */}
      {selectedMatch && (
        <div className="modal-backdrop z-[9999]" onClick={() => setSelectedMatch(null)}>
          <div 
            className="glass-panel w-full max-w-sm p-5 relative shadow-2xl border border-white/10 rounded-2xl bg-[#0c1410]/95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button 
              type="button"
              onClick={() => setSelectedMatch(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="mb-4">
              <span className="text-[9px] text-emerald-400 font-extrabold tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-mono">
                Dự đoán Trận #{selectedMatch.num}
              </span>
              <h3 className="text-sm font-bold text-gray-500 mt-2 flex items-center gap-1 font-mono">
                <Calendar size={10} /> Vòng: {selectedMatch.group} • {selectedMatch.date} {selectedMatch.time}
              </h3>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-3.5 p-3 rounded-xl border bg-red-500/10 border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Match Teams Info Details */}
            <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 mb-4 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                  {getCountryEmoji(selectedMatch.teamHome)} {getFriendlyTeamName(selectedMatch.teamHome)}
                </span>
                <span className="font-bold text-gray-400 font-mono">
                  {selectedMatch.scoreHome !== null ? `Thực tế: ${selectedMatch.scoreHome}` : ''}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                  {getCountryEmoji(selectedMatch.teamAway)} {getFriendlyTeamName(selectedMatch.teamAway)}
                </span>
                <span className="font-bold text-gray-400 font-mono">
                  {selectedMatch.scoreAway !== null ? `Thực tế: ${selectedMatch.scoreAway}` : ''}
                </span>
              </div>
            </div>

            {/* Form */}
            {(() => {
              const isVoteOpen = (selectedMatch.date === today || selectedMatch.date === tomorrow) && !selectedMatch.isLocked;

              if (selectedMatch.scoreHome !== null && selectedMatch.scoreAway !== null) {
                // Completed match info view
                return (
                  <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 space-y-1.5">
                    <p className="font-medium text-gray-300">Trận đấu đã kết thúc với tỷ số:</p>
                    <p className="text-lg font-extrabold text-white font-mono">{selectedMatch.scoreHome} - {selectedMatch.scoreAway}</p>
                    {selectedMatch.prediction ? (
                      <p className="text-[11px] mt-1">
                        Dự đoán của bạn: <span className="font-bold font-mono text-emerald-400">{selectedMatch.prediction.predictHome} - {selectedMatch.prediction.predictAway}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-red-400 italic mt-1">Bạn đã không bình chọn cho trận này.</p>
                    )}
                  </div>
                );
              }

              if (selectedMatch.isLocked) {
                // Closed voting but match not yet finished
                return (
                  <div className="text-center p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 space-y-1">
                    <p className="font-medium text-gray-300">🔒 Bình chọn đã đóng (Trận đấu đang diễn ra)</p>
                    {selectedMatch.prediction ? (
                      <p className="mt-1">
                        Dự đoán đã lưu: <span className="font-bold font-mono text-emerald-400">{selectedMatch.prediction.predictHome} - {selectedMatch.prediction.predictAway}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-gray-500 italic mt-1">Bạn đã không bình chọn trận này trước giờ bắt đầu.</p>
                    )}
                  </div>
                );
              }

              if (isVoteOpen) {
                // Active prediction form
                return (
                  <form onSubmit={handleSavePrediction} className="space-y-4">
                    <div className="flex items-center justify-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                      <div className="text-center flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">{getFriendlyTeamName(selectedMatch.teamHome)}</span>
                        <input
                          type="number"
                          min="0"
                          className="score-type-input text-center w-14 font-mono text-base font-bold bg-black/40 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                          placeholder="0"
                          value={predHome}
                          onChange={(e) => setPredHome(e.target.value)}
                          required
                        />
                      </div>
                      <span className="text-gray-500 font-extrabold text-lg mt-4">:</span>
                      <div className="text-center flex flex-col items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">{getFriendlyTeamName(selectedMatch.teamAway)}</span>
                        <input
                          type="number"
                          min="0"
                          className="score-type-input text-center w-14 font-mono text-base font-bold bg-black/40 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
                          placeholder="0"
                          value={predAway}
                          onChange={(e) => setPredAway(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMatch(null)}
                        className="w-1/3 btn btn-secondary py-2"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-2/3 btn btn-primary py-2 flex items-center justify-center gap-1.5"
                      >
                        {saving ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></span>
                        ) : (
                          <>
                            <Save size={14} /> Lưu Dự Đoán
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                );
              }

              // Future match, not yet open
              return (
                <div className="text-center p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-500 space-y-1">
                  <p className="font-semibold text-gray-400">🔒 Chưa đến ngày mở bình chọn</p>
                  <p className="text-[10px] italic">Bình chọn sẽ mở vào ngày {selectedMatch.date}</p>
                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
}
