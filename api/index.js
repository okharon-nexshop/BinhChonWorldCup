import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'url';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readDB, writeDB } from '../server/db.js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'worldcup2026-super-secret-key-change-in-prod';

app.use(express.json());
app.use(cookieParser());

// Middleware to authenticate users
const authenticate = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await readDB();
    const user = db.users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Phiên làm việc hết hạn' });
  }
};

// Middleware for admin actions
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};

// Helper to determine if a match is locked for predictions
const isMatchLocked = (matchDatetime) => {
  const kickoff = new Date(matchDatetime);
  const now = new Date();
  return now >= kickoff;
};

// --- AUTH ROUTER ---
app.get('/api/auth/me', authenticate, (req, res) => {
  const { passwordHash, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên đăng nhập và mật khẩu' });
  }

  try {
    const db = await readDB();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ message: 'Đăng nhập thành công', user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password, displayName, inviteCode } = req.body;
  if (!username || !password || !displayName || !inviteCode) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' });
  }

  if (username.length < 3) {
    return res.status(400).json({ message: 'Tên đăng nhập phải có ít nhất 3 ký tự' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }

  try {
    const db = await readDB();
    
    if (inviteCode !== db.settings.inviteCode) {
      return res.status(400).json({ message: 'Mã mời tham gia nhóm không chính xác' });
    }

    const userExists = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (userExists) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `user_${Date.now()}`,
      username: username.trim(),
      passwordHash,
      displayName: displayName.trim(),
      role: 'user',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await writeDB(db);

    const token = jwt.sign({ userId: newUser.id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ message: 'Đăng ký tài khoản thành công', user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Đăng xuất thành công' });
});

// Google Authentication Configuration
app.get('/api/auth/google/config', (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID || '' });
});

// Google Login
app.post('/api/auth/google/login', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Thiếu mã xác thực Google' });
  }

  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!response.ok) {
      return res.status(400).json({ message: 'Xác thực tài khoản Google thất bại' });
    }
    const payload = await response.json();
    const { sub: googleId, email, name } = payload;

    const db = await readDB();
    let user = db.users.find(u => u.googleId === googleId || u.username.toLowerCase() === email.toLowerCase());

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await writeDB(db);
      }
      const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      const { passwordHash, ...userWithoutPassword } = user;
      return res.json({ message: 'Đăng nhập thành công', user: userWithoutPassword });
    } else {
      return res.json({ status: 'needs_invite', googleId, email, name });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Google Registration (Confirm Invite Code)
app.post('/api/auth/google/register', async (req, res) => {
  const { inviteCode, googleId, email, name } = req.body;
  if (!inviteCode || !googleId || !email || !name) {
    return res.status(400).json({ message: 'Thông tin đăng ký Google không hợp lệ' });
  }

  try {
    const db = await readDB();
    if (inviteCode !== db.settings.inviteCode) {
      return res.status(400).json({ message: 'Mã mời tham gia nhóm không chính xác' });
    }

    const userExists = db.users.find(u => u.googleId === googleId || u.username.toLowerCase() === email.toLowerCase());
    if (userExists) {
      return res.status(400).json({ message: 'Tài khoản đã tồn tại' });
    }

    const newUser = {
      id: `user_${Date.now()}`,
      username: email.toLowerCase().trim(),
      displayName: name.trim(),
      googleId,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await writeDB(db);

    const token = jwt.sign({ userId: newUser.id, username: newUser.username, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ message: 'Đăng ký tài khoản thành công', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});


app.post('/api/auth/change-password', authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }

  try {
    const db = await readDB();
    const userIdx = db.users.findIndex(u => u.id === req.user.id);
    const user = db.users[userIdx];

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu cũ không chính xác' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    
    db.users[userIdx] = user;
    await writeDB(db);

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// --- MATCHES ROUTER ---
app.get('/api/matches', authenticate, async (req, res) => {
  try {
    const db = await readDB();
    const userId = req.user.id;
    
    const matchesWithPredictions = db.matches.map(m => {
      const pred = db.predictions.find(p => p.userId === userId && p.matchId === m.id);
      return {
        ...m,
        isLocked: isMatchLocked(m.datetime),
        prediction: pred ? { predictHome: pred.predictHome, predictAway: pred.predictAway } : null
      };
    });

    res.json({ matches: matchesWithPredictions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// --- PREDICTIONS ROUTER ---
app.post('/api/predictions', authenticate, async (req, res) => {
  const { matchId, predictHome, predictAway } = req.body;
  
  if (matchId === undefined || predictHome === undefined || predictAway === undefined) {
    return res.status(400).json({ message: 'Thông tin gửi lên thiếu (cần matchId, predictHome, predictAway)' });
  }

  const hScore = parseInt(predictHome, 10);
  const aScore = parseInt(predictAway, 10);

  if (isNaN(hScore) || isNaN(aScore) || hScore < 0 || aScore < 0) {
    return res.status(400).json({ message: 'Tỷ số dự đoán phải là số nguyên lớn hơn hoặc bằng 0' });
  }

  try {
    const db = await readDB();
    const match = db.matches.find(m => m.id === matchId);
    if (!match) {
      return res.status(404).json({ message: 'Trận đấu không tồn tại' });
    }

    if (isMatchLocked(match.datetime)) {
      return res.status(400).json({ message: 'Trận đấu đã diễn ra hoặc đang đá, không thể bình chọn hay thay đổi!' });
    }

    const userId = req.user.id;
    const existingPredIdx = db.predictions.findIndex(p => p.userId === userId && p.matchId === matchId);
    const outcome = hScore > aScore ? 'home' : (hScore === aScore ? 'draw' : 'away');

    if (existingPredIdx !== -1) {
      db.predictions[existingPredIdx] = {
        ...db.predictions[existingPredIdx],
        predictHome: hScore,
        predictAway: aScore,
        outcome,
        updatedAt: new Date().toISOString()
      };
    } else {
      db.predictions.push({
        id: `pred_${userId}_${matchId}`,
        userId,
        matchId,
        predictHome: hScore,
        predictAway: aScore,
        outcome,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    await writeDB(db);
    res.json({ message: 'Lưu bình chọn thành công', prediction: { predictHome: hScore, predictAway: aScore } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// --- LEADERBOARD & STATS ROUTER ---
app.get('/api/leaderboard', authenticate, async (req, res) => {
  try {
    const db = await readDB();
    const finishedMatches = db.matches.filter(m => m.scoreHome !== null && m.scoreAway !== null);
    
    const userStats = db.users.map(u => {
      let balance = 0;
      let correctScores = 0;
      let correctOutcomes = 0;
      let wrongOutcomes = 0;
      let missed = 0;

      finishedMatches.forEach(m => {
        const pred = db.predictions.find(p => p.userId === u.id && p.matchId === m.id);
        const actualOutcome = m.scoreHome > m.scoreAway ? 'home' : (m.scoreHome === m.scoreAway ? 'draw' : 'away');

        if (pred) {
          const predictedOutcome = pred.predictHome > pred.predictAway ? 'home' : (pred.predictHome === pred.predictAway ? 'draw' : 'away');
          const isExactScore = pred.predictHome === m.scoreHome && pred.predictAway === m.scoreAway;

          if (isExactScore) {
            balance += 100;
            correctScores++;
          } else if (predictedOutcome === actualOutcome) {
            balance += 0;
            correctOutcomes++;
          } else {
            balance -= 100;
            wrongOutcomes++;
          }
        } else {
          balance -= 100;
          missed++;
        }
      });

      return {
        userId: u.id,
        username: u.username,
        displayName: u.displayName,
        role: u.role,
        balance,
        correctScores,
        correctOutcomes,
        wrongOutcomes,
        missed,
        totalFinished: finishedMatches.length
      };
    });

    userStats.sort((a, b) => {
      if (b.balance !== a.balance) return b.balance - a.balance;
      if (b.correctScores !== a.correctScores) return b.correctScores - a.correctScores;
      if (b.correctOutcomes !== a.correctOutcomes) return b.correctOutcomes - a.correctOutcomes;
      return a.displayName.localeCompare(b.displayName);
    });

    const totalUserBalance = userStats.reduce((sum, u) => sum + u.balance, 0);
    const poolBalance = -totalUserBalance;

    res.json({
      leaderboard: userStats,
      poolBalance,
      finishedCount: finishedMatches.length,
      totalCount: db.matches.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

app.get('/api/leaderboard/user/:userId', authenticate, async (req, res) => {
  const targetUserId = req.params.userId;
  try {
    const db = await readDB();
    const targetUser = db.users.find(u => u.id === targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const matchesWithPredictions = db.matches.map(m => {
      const pred = db.predictions.find(p => p.userId === targetUserId && p.matchId === m.id);
      const isLocked = isMatchLocked(m.datetime);
      
      let prediction = null;
      if (pred) {
        if (isLocked || req.user.id === targetUserId || req.user.role === 'admin') {
          prediction = { predictHome: pred.predictHome, predictAway: pred.predictAway };
        } else {
          prediction = { predictHome: '?', predictAway: '?', isMasked: true };
        }
      }

      let result = null;
      if (m.scoreHome !== null && m.scoreAway !== null) {
        if (pred) {
          const isExact = pred.predictHome === m.scoreHome && pred.predictAway === m.scoreAway;
          const predOutcome = pred.predictHome > pred.predictAway ? 'home' : (pred.predictHome === pred.predictAway ? 'draw' : 'away');
          const actOutcome = m.scoreHome > m.scoreAway ? 'home' : (m.scoreHome === m.scoreAway ? 'draw' : 'away');

          if (isExact) result = 'exact';
          else if (predOutcome === actOutcome) result = 'outcome';
          else result = 'wrong';
        } else {
          result = 'missed';
        }
      }

      return {
        id: m.id,
        group: m.group,
        date: m.date,
        time: m.time,
        teamHome: m.teamHome,
        teamAway: m.teamAway,
        scoreHome: m.scoreHome,
        scoreAway: m.scoreAway,
        isLocked,
        prediction,
        result
      };
    });

    res.json({
      user: {
        id: targetUser.id,
        displayName: targetUser.displayName,
        username: targetUser.username
      },
      matches: matchesWithPredictions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// --- ADMIN ROUTER ---
app.get('/api/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const db = await readDB();
    const usersWithoutHash = db.users.map(({ passwordHash, ...u }) => u);
    res.json({ users: usersWithoutHash, inviteCode: db.settings.inviteCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

app.post('/api/admin/invite-code', authenticate, requireAdmin, async (req, res) => {
  const { inviteCode } = req.body;
  if (!inviteCode || inviteCode.trim() === '') {
    return res.status(400).json({ message: 'Mã mời không được để trống' });
  }
  try {
    const db = await readDB();
    db.settings.inviteCode = inviteCode.trim();
    await writeDB(db);
    res.json({ message: 'Cập nhật mã mời thành công', inviteCode: db.settings.inviteCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

app.put('/api/admin/users/:userId', authenticate, requireAdmin, async (req, res) => {
  const targetId = req.params.userId;
  const { displayName, role } = req.body;

  try {
    const db = await readDB();
    const userIdx = db.users.findIndex(u => u.id === targetId);
    if (userIdx === -1) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (targetId === 'user_admin' && role && role !== 'admin') {
      return res.status(400).json({ message: 'Không thể hạ quyền của tài khoản admin mặc định' });
    }

    if (displayName) db.users[userIdx].displayName = displayName.trim();
    if (role) db.users[userIdx].role = role;

    await writeDB(db);
    const { passwordHash, ...userWithoutPassword } = db.users[userIdx];
    res.json({ message: 'Cập nhật thông tin thành công', user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

app.post('/api/admin/users/:userId/reset-password', authenticate, requireAdmin, async (req, res) => {
  const targetId = req.params.userId;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }

  try {
    const db = await readDB();
    const userIdx = db.users.findIndex(u => u.id === targetId);
    if (userIdx === -1) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const salt = await bcrypt.genSalt(10);
    db.users[userIdx].passwordHash = await bcrypt.hash(newPassword, salt);

    await writeDB(db);
    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

app.delete('/api/admin/users/:userId', authenticate, requireAdmin, async (req, res) => {
  const targetId = req.params.userId;
  if (targetId === 'user_admin' || targetId === req.user.id) {
    return res.status(400).json({ message: 'Không thể xóa chính mình hoặc tài khoản admin mặc định' });
  }

  try {
    const db = await readDB();
    const userExists = db.users.find(u => u.id === targetId);
    if (!userExists) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    db.users = db.users.filter(u => u.id !== targetId);
    db.predictions = db.predictions.filter(p => p.userId !== targetId);

    await writeDB(db);
    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

app.post('/api/admin/matches', authenticate, requireAdmin, async (req, res) => {
  const { group, date, time, teamHome, teamAway } = req.body;
  if (!group || !date || !time || !teamHome || !teamAway) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin trận đấu mới' });
  }

  try {
    const db = await readDB();
    
    const [day, month] = date.split('/');
    const [hour, minute] = time.split(':');
    const datetime = `2026-${month}-${day}T${hour}:${minute}:00+07:00`;

    const newMatch = {
      id: `match_${Date.now()}`,
      group: group.trim(),
      date: date.trim(),
      time: time.trim(),
      datetime,
      teamHome: teamHome.trim(),
      teamAway: teamAway.trim(),
      scoreHome: null,
      scoreAway: null
    };

    db.matches.push(newMatch);
    db.matches.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    
    await writeDB(db);
    res.status(201).json({ message: 'Tạo trận đấu mới thành công', match: newMatch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

app.delete('/api/admin/matches/:matchId', authenticate, requireAdmin, async (req, res) => {
  const matchId = req.params.matchId;

  try {
    const db = await readDB();
    const matchExists = db.matches.find(m => m.id === matchId);
    if (!matchExists) {
      return res.status(404).json({ message: 'Không tìm thấy trận đấu' });
    }

    db.matches = db.matches.filter(m => m.id !== matchId);
    db.predictions = db.predictions.filter(p => p.matchId !== matchId);

    await writeDB(db);
    res.json({ message: 'Xóa trận đấu thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

app.post('/api/admin/matches/:matchId/score', authenticate, requireAdmin, async (req, res) => {
  const matchId = req.params.matchId;
  const { scoreHome, scoreAway } = req.body;

  try {
    const db = await readDB();
    const matchIdx = db.matches.findIndex(m => m.id === matchId);
    if (matchIdx === -1) {
      return res.status(404).json({ message: 'Không tìm thấy trận đấu' });
    }

    const match = db.matches[matchIdx];

    if (scoreHome === null || scoreAway === null) {
      match.scoreHome = null;
      match.scoreAway = null;
    } else {
      const sH = parseInt(scoreHome, 10);
      const sA = parseInt(scoreAway, 10);
      if (isNaN(sH) || isNaN(sA) || sH < 0 || sA < 0) {
        return res.status(400).json({ message: 'Tỷ số phải là số nguyên không âm hoặc null' });
      }
      match.scoreHome = sH;
      match.scoreAway = sA;
    }

    db.matches[matchIdx] = match;
    await writeDB(db);

    res.json({ message: 'Cập nhật tỷ số trận đấu thành công', match });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

export default app;
