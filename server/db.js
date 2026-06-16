import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Default group matches parsed from user request
const groupMatches = [
  // Bảng A
  { group: 'Bảng A', date: '12/06', time: '02:00', teamHome: 'Mexico', teamAway: 'Nam Phi', scoreHome: 2, scoreAway: 0 },
  { group: 'Bảng A', date: '12/06', time: '09:00', teamHome: 'Hàn Quốc', teamAway: 'Cộng hòa Séc', scoreHome: 2, scoreAway: 1 },
  { group: 'Bảng A', date: '18/06', time: '23:00', teamHome: 'Cộng hòa Séc', teamAway: 'Nam Phi' },
  { group: 'Bảng A', date: '19/06', time: '08:00', teamHome: 'Mexico', teamAway: 'Hàn Quốc' },
  { group: 'Bảng A', date: '25/06', time: '08:00', teamHome: 'Nam Phi', teamAway: 'Hàn Quốc' },
  { group: 'Bảng A', date: '25/06', time: '08:00', teamHome: 'Cộng hòa Séc', teamAway: 'Mexico' },
  // Bảng B
  { group: 'Bảng B', date: '13/06', time: '02:00', teamHome: 'Canada', teamAway: 'Bosnia', scoreHome: 1, scoreAway: 1 },
  { group: 'Bảng B', date: '14/06', time: '02:00', teamHome: 'Qatar', teamAway: 'Thụy Sĩ', scoreHome: 1, scoreAway: 1 },
  { group: 'Bảng B', date: '19/06', time: '02:00', teamHome: 'Thụy Sĩ', teamAway: 'Bosnia' },
  { group: 'Bảng B', date: '19/06', time: '05:00', teamHome: 'Canada', teamAway: 'Qatar' },
  { group: 'Bảng B', date: '25/06', time: '02:00', teamHome: 'Thụy Sĩ', teamAway: 'Canada' },
  { group: 'Bảng B', date: '25/06', time: '02:00', teamHome: 'Bosnia', teamAway: 'Qatar' },
  // Bảng C
  { group: 'Bảng C', date: '14/06', time: '05:00', teamHome: 'Brazil', teamAway: 'Morocco', scoreHome: 1, scoreAway: 1 },
  { group: 'Bảng C', date: '14/06', time: '08:00', teamHome: 'Haiti', teamAway: 'Scotland', scoreHome: 0, scoreAway: 1 },
  { group: 'Bảng C', date: '20/06', time: '05:00', teamHome: 'Scotland', teamAway: 'Morocco' },
  { group: 'Bảng C', date: '20/06', time: '08:00', teamHome: 'Brazil', teamAway: 'Haiti' },
  { group: 'Bảng C', date: '25/06', time: '05:00', teamHome: 'Morocco', teamAway: 'Haiti' },
  { group: 'Bảng C', date: '25/06', time: '05:00', teamHome: 'Scotland', teamAway: 'Brazil' },
  // Bảng D
  { group: 'Bảng D', date: '13/06', time: '08:00', teamHome: 'Mỹ', teamAway: 'Paraguay', scoreHome: 4, scoreAway: 1 },
  { group: 'Bảng D', date: '14/06', time: '11:00', teamHome: 'Úc', teamAway: 'Thổ Nhĩ Kỳ', scoreHome: 2, scoreAway: 0 },
  { group: 'Bảng D', date: '20/06', time: '02:00', teamHome: 'Mỹ', teamAway: 'Úc' },
  { group: 'Bảng D', date: '20/06', time: '11:00', teamHome: 'Thổ Nhĩ Kỳ', teamAway: 'Paraguay' },
  { group: 'Bảng D', date: '26/06', time: '09:00', teamHome: 'Mỹ', teamAway: 'Thổ Nhĩ Kỳ' },
  { group: 'Bảng D', date: '26/06', time: '09:00', teamHome: 'Paraguay', teamAway: 'Úc' },
  // Bảng E
  { group: 'Bảng E', date: '15/06', time: '00:00', teamHome: 'Đức', teamAway: 'Curaçao', scoreHome: 7, scoreAway: 1 },
  { group: 'Bảng E', date: '15/06', time: '06:00', teamHome: 'Bờ Biển Ngà', teamAway: 'Ecuador', scoreHome: 1, scoreAway: 0 },
  { group: 'Bảng E', date: '21/06', time: '03:00', teamHome: 'Đức', teamAway: 'Bờ Biển Ngà' },
  { group: 'Bảng E', date: '21/06', time: '07:00', teamHome: 'Ecuador', teamAway: 'Curaçao' },
  { group: 'Bảng E', date: '26/06', time: '03:00', teamHome: 'Ecuador', teamAway: 'Đức' },
  { group: 'Bảng E', date: '26/06', time: '03:00', teamHome: 'Curaçao', teamAway: 'Bờ Biển Ngà' },
  // Bảng F
  { group: 'Bảng F', date: '15/06', time: '03:00', teamHome: 'Hà Lan', teamAway: 'Nhật Bản', scoreHome: 2, scoreAway: 2 },
  { group: 'Bảng F', date: '15/06', time: '09:00', teamHome: 'Thụy Điển', teamAway: 'Tunisia', scoreHome: 5, scoreAway: 1 },
  { group: 'Bảng F', date: '21/06', time: '00:00', teamHome: 'Hà Lan', teamAway: 'Thụy Điển' },
  { group: 'Bảng F', date: '21/06', time: '11:00', teamHome: 'Tunisia', teamAway: 'Nhật Bản' },
  { group: 'Bảng F', date: '26/06', time: '06:00', teamHome: 'Nhật Bản', teamAway: 'Thụy Điển' },
  { group: 'Bảng F', date: '26/06', time: '06:00', teamHome: 'Tunisia', teamAway: 'Hà Lan' },
  // Bảng G
  { group: 'Bảng G', date: '16/06', time: '02:00', teamHome: 'Bỉ', teamAway: 'Ai Cập', scoreHome: 1, scoreAway: 1 },
  { group: 'Bảng G', date: '16/06', time: '08:00', teamHome: 'Iran', teamAway: 'New Zealand', scoreHome: 2, scoreAway: 2 },
  { group: 'Bảng G', date: '22/06', time: '02:00', teamHome: 'Bỉ', teamAway: 'Iran' },
  { group: 'Bảng G', date: '22/06', time: '08:00', teamHome: 'New Zealand', teamAway: 'Ai Cập' },
  { group: 'Bảng G', date: '27/06', time: '10:00', teamHome: 'New Zealand', teamAway: 'Bỉ' },
  { group: 'Bảng G', date: '27/06', time: '10:00', teamHome: 'Ai Cập', teamAway: 'Iran' },
  // Bảng H
  { group: 'Bảng H', date: '15/06', time: '23:00', teamHome: 'Tây Ban Nha', teamAway: 'Cape Verde', scoreHome: 0, scoreAway: 0 },
  { group: 'Bảng H', date: '16/06', time: '05:00', teamHome: 'Ả Rập Xê Út', teamAway: 'Uruguay', scoreHome: 1, scoreAway: 1 },
  { group: 'Bảng H', date: '21/06', time: '23:00', teamHome: 'Tây Ban Nha', teamAway: 'Ả Rập Xê Út' },
  { group: 'Bảng H', date: '22/06', time: '05:00', teamHome: 'Uruguay', teamAway: 'Cape Verde' },
  { group: 'Bảng H', date: '27/06', time: '07:00', teamHome: 'Cape Verde', teamAway: 'Ả Rập Xê Út' },
  { group: 'Bảng H', date: '27/06', time: '07:00', teamHome: 'Uruguay', teamAway: 'Tây Ban Nha' },
  // Bảng I
  { group: 'Bảng I', date: '17/06', time: '02:00', teamHome: 'Pháp', teamAway: 'Senegal' },
  { group: 'Bảng I', date: '17/06', time: '05:00', teamHome: 'Iraq', teamAway: 'Na Uy' },
  { group: 'Bảng I', date: '23/06', time: '04:00', teamHome: 'Pháp', teamAway: 'Iraq' },
  { group: 'Bảng I', date: '23/06', time: '07:00', teamHome: 'Na Uy', teamAway: 'Senegal' },
  { group: 'Bảng I', date: '27/06', time: '02:00', teamHome: 'Na Uy', teamAway: 'Pháp' },
  { group: 'Bảng I', date: '27/06', time: '02:00', teamHome: 'Senegal', teamAway: 'Iraq' },
  // Bảng J
  { group: 'Bảng J', date: '17/06', time: '08:00', teamHome: 'Argentina', teamAway: 'Algeria' },
  { group: 'Bảng J', date: '17/06', time: '11:00', teamHome: 'Áo', teamAway: 'Jordan' },
  { group: 'Bảng J', date: '23/06', time: '00:00', teamHome: 'Argentina', teamAway: 'Áo' },
  { group: 'Bảng J', date: '23/06', time: '10:00', teamHome: 'Jordan', teamAway: 'Algeria' },
  { group: 'Bảng J', date: '28/06', time: '09:00', teamHome: 'Algeria', teamAway: 'Áo' },
  { group: 'Bảng J', date: '28/06', time: '09:00', teamHome: 'Jordan', teamAway: 'Argentina' },
  // Bảng K
  { group: 'Bảng K', date: '18/06', time: '00:00', teamHome: 'Bồ Đào Nha', teamAway: 'CHDC Congo' },
  { group: 'Bảng K', date: '18/06', time: '09:00', teamHome: 'Uzbekistan', teamAway: 'Colombia' },
  { group: 'Bảng K', date: '24/06', time: '00:00', teamHome: 'Bồ Đào Nha', teamAway: 'Uzbekistan' },
  { group: 'Bảng K', date: '24/06', time: '09:00', teamHome: 'Colombia', teamAway: 'CHDC Congo' },
  { group: 'Bảng K', date: '28/06', time: '06:30', teamHome: 'Colombia', teamAway: 'Bồ Đào Nha' },
  { group: 'Bảng K', date: '28/06', time: '06:30', teamHome: 'CHDC Congo', teamAway: 'Uzbekistan' },
  // Bảng L
  { group: 'Bảng L', date: '18/06', time: '03:00', teamHome: 'Anh', teamAway: 'Croatia' },
  { group: 'Bảng L', date: '18/06', time: '06:00', teamHome: 'Ghana', teamAway: 'Panama' },
  { group: 'Bảng L', date: '24/06', time: '03:00', teamHome: 'Anh', teamAway: 'Ghana' },
  { group: 'Bảng L', date: '24/06', time: '06:00', teamHome: 'Panama', teamAway: 'Croatia' },
  { group: 'Bảng L', date: '28/06', time: '04:00', teamHome: 'Panama', teamAway: 'Anh' },
  { group: 'Bảng L', date: '28/06', time: '04:00', teamHome: 'Croatia', teamAway: 'Ghana' }
];

// Helper to convert DD/MM and HH:MM to ISO string with GMT+7
function parseMatchDatetime(dateStr, timeStr) {
  const [day, month] = dateStr.split('/');
  const [hour, minute] = timeStr.split(':');
  return `2026-${month}-${day}T${hour}:${minute}:00+07:00`;
}

// Format initial matches
const seededMatches = groupMatches.map((m, idx) => ({
  id: `match_${idx + 1}`,
  group: m.group,
  date: m.date,
  time: m.time,
  datetime: parseMatchDatetime(m.date, m.time),
  teamHome: m.teamHome,
  teamAway: m.teamAway,
  scoreHome: m.scoreHome !== undefined ? m.scoreHome : null,
  scoreAway: m.scoreAway !== undefined ? m.scoreAway : null
}));

// Initialize database template
const defaultDB = {
  users: [
    {
      id: 'user_admin',
      username: 'admin',
      // Hash of 'admin2026'
      passwordHash: '$2b$10$bWB8iMQWY1cBDcamtmseO.dvw3L5b4Dh6AX0ptRKVKGMEMeH2/n1y',
      displayName: 'Quản trị viên',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ],
  matches: seededMatches,
  predictions: [],
  settings: {
    inviteCode: 'HOANGVIET2026'
  }
};

// Queue to serialize writes and prevent concurrent corruption
let writeQueue = Promise.resolve();

const MONGODB_URI = process.env.MONGODB_URI;
let mongoClient = null;
let dbInstance = null;

async function getMongoCollection() {
  if (!mongoClient || !dbInstance) {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    dbInstance = mongoClient.db('binhchonworldcup');
  }
  return dbInstance.collection('app_state');
}

function migrateDatabase(db) {
  const tbdMapping = {
    'Bảng A': 'Cộng hòa Séc',
    'Bảng B': 'Bosnia',
    'Bảng D': 'Thổ Nhĩ Kỳ',
    'Bảng F': 'Thụy Điển',
    'Bảng I': 'Iraq',
    'Bảng K': 'CHDC Congo'
  };

  let needsMigration = false;
  if (db && db.matches && Array.isArray(db.matches)) {
    db.matches = db.matches.map(m => {
      let updated = false;
      let teamHome = m.teamHome;
      let teamAway = m.teamAway;
      let scoreHome = m.scoreHome;
      let scoreAway = m.scoreAway;

      // 1. Migrate TBD team names
      if (teamHome === 'TBD' && tbdMapping[m.group]) {
        teamHome = tbdMapping[m.group];
        updated = true;
      }
      if (teamAway === 'TBD' && tbdMapping[m.group]) {
        teamAway = tbdMapping[m.group];
        updated = true;
      }

      // 2. Migrate scores for completed matches
      const seedMatch = seededMatches.find(sm => sm.teamHome === teamHome && sm.teamAway === teamAway);
      if (seedMatch && seedMatch.scoreHome !== null && seedMatch.scoreAway !== null) {
        if (scoreHome === null || scoreAway === null) {
          scoreHome = seedMatch.scoreHome;
          scoreAway = seedMatch.scoreAway;
          updated = true;
        }
      }

      if (updated) {
        needsMigration = true;
        return { ...m, teamHome, teamAway, scoreHome, scoreAway };
      }
      return m;
    });
  }
  return { db, needsMigration };
}

export async function readDB() {
  if (MONGODB_URI) {
    try {
      const collection = await getMongoCollection();
      const doc = await collection.findOne({ _id: 'state_document' });
      if (!doc) {
        // Bootstrap MongoDB with local db.json data if exists, otherwise use defaultDB
        let bootstrapData = defaultDB;
        if (fs.existsSync(DB_PATH)) {
          try {
            const localData = await fs.promises.readFile(DB_PATH, 'utf8');
            bootstrapData = JSON.parse(localData);
            console.log('Bootstrapping MongoDB Atlas with local database contents!');
          } catch (e) {
            console.error('Failed to read local db.json for bootstrapping MongoDB:', e);
          }
        }
        const { db: migratedDB } = migrateDatabase(bootstrapData);
        await collection.insertOne({ _id: 'state_document', ...migratedDB });
        return JSON.parse(JSON.stringify(migratedDB));
      }
      const { _id, ...rest } = doc;
      let { db: migratedDB, needsMigration } = migrateDatabase(rest);
      
      let updatedScores = false;
      try {
        const autoResult = await autoUpdateScores(migratedDB);
        migratedDB = autoResult.db;
        updatedScores = autoResult.updated;
      } catch (err) {
        console.error('Auto update score error in MongoDB:', err);
      }

      if (needsMigration || updatedScores) {
        console.log('Writing updated db state to MongoDB...');
        await writeDB(migratedDB);
      }
      return migratedDB;
    } catch (error) {
      console.error('Error reading from MongoDB Atlas, falling back to default:', error);
      const { db: migratedDB } = migrateDatabase(defaultDB);
      return migratedDB;
    }
  }

  // Local fallback
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      const { db: migratedDB } = migrateDatabase(defaultDB);
      await writeDB(migratedDB);
      return migratedDB;
    }
    const data = await fs.promises.readFile(DB_PATH, 'utf8');
    const parsed = JSON.parse(data);
    let { db: migratedDB, needsMigration } = migrateDatabase(parsed);
    
    let updatedScores = false;
    try {
      const autoResult = await autoUpdateScores(migratedDB);
      migratedDB = autoResult.db;
      updatedScores = autoResult.updated;
    } catch (err) {
      console.error('Auto update score error in local JSON:', err);
    }

    if (needsMigration || updatedScores) {
      console.log('Writing updated db state to local JSON...');
      await writeDB(migratedDB);
    }
    return migratedDB;
  } catch (error) {
    console.error('Error reading database file, returning default database template:', error);
    const { db: migratedDB } = migrateDatabase(defaultDB);
    return migratedDB;
  }
}

export async function writeDB(data) {
  if (MONGODB_URI) {
    try {
      const collection = await getMongoCollection();
      await collection.replaceOne(
        { _id: 'state_document' },
        { _id: 'state_document', ...data },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error writing database to MongoDB Atlas:', error);
      throw error;
    }
    return;
  }

  // Local fallback
  writeQueue = writeQueue.catch(() => {}).then(async () => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      await fs.promises.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error writing database file:', error);
      throw error;
    }
  });
  return writeQueue;
}

// --- AUTO SCORE UPDATES & CONGRATULATIONS LAYER ---

const teamTranslation = {
  "Mexico": "Mexico",
  "South Africa": "Nam Phi",
  "South Korea": "Hàn Quốc",
  "Czech Republic": "Cộng hòa Séc",
  "Czechia": "Cộng hòa Séc",
  "Canada": "Canada",
  "Bosnia & Herzegovina": "Bosnia",
  "Bosnia": "Bosnia",
  "Qatar": "Qatar",
  "Switzerland": "Thụy Sĩ",
  "Brazil": "Brazil",
  "Morocco": "Morocco",
  "Haiti": "Haiti",
  "Scotland": "Scotland",
  "United States": "Mỹ",
  "USA": "Mỹ",
  "Paraguay": "Paraguay",
  "Australia": "Úc",
  "Turkey": "Thổ Nhĩ Kỳ",
  "Germany": "Đức",
  "Curaçao": "Curaçao",
  "Curacao": "Curaçao",
  "Ivory Coast": "Bờ Biển Ngà",
  "Ecuador": "Ecuador",
  "Netherlands": "Hà Lan",
  "Japan": "Nhật Bản",
  "Sweden": "Thụy Điển",
  "Tunisia": "Tunisia",
  "Belgium": "Bỉ",
  "Egypt": "Ai Cập",
  "Iran": "Iran",
  "New Zealand": "New Zealand",
  "Spain": "Tây Ban Nha",
  "Cape Verde": "Cape Verde",
  "Saudi Arabia": "Ả Rập Xê Út",
  "Uruguay": "Uruguay",
  "France": "Pháp",
  "Senegal": "Senegal",
  "Iraq": "Iraq",
  "Norway": "Na Uy",
  "Argentina": "Argentina",
  "Algeria": "Algeria",
  "Austria": "Áo",
  "Jordan": "Jordan",
  "Portugal": "Bồ Đào Nha",
  "DR Congo": "CHDC Congo",
  "Congo DR": "CHDC Congo",
  "CHDC Congo": "CHDC Congo",
  "Uzbekistan": "Uzbekistan",
  "Colombia": "Colombia",
  "England": "Anh",
  "Croatia": "Croatia",
  "Ghana": "Ghana",
  "Panama": "Panama"
};

export async function autoUpdateScores(db) {
  if (!db.settings) {
    db.settings = {};
  }
  
  // Today's date in GMT+7
  const todayGMT7 = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  if (db.settings.lastAutoUpdate === todayGMT7) {
    return { db, updated: false };
  }
  
  console.log(`Checking for automatic match score updates for ${todayGMT7}...`);
  try {
    const res = await fetch('https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    if (!data || !Array.isArray(data.matches)) {
      throw new Error('Invalid JSON format from openfootball');
    }
    
    let updatedCount = 0;
    
    for (const item of data.matches) {
      if (item.score && Array.isArray(item.score.ft)) {
        const homeEng = item.team1;
        const awayEng = item.team2;
        
        const homeViet = teamTranslation[homeEng];
        const awayViet = teamTranslation[awayEng];
        
        if (homeViet && awayViet) {
          const matchIdx = db.matches.findIndex(m => m.teamHome === homeViet && m.teamAway === awayViet);
          if (matchIdx !== -1) {
            const m = db.matches[matchIdx];
            const scoreHome = item.score.ft[0];
            const scoreAway = item.score.ft[1];
            
            if (m.scoreHome === null || m.scoreAway === null || m.scoreHome !== scoreHome || m.scoreAway !== scoreAway) {
              db.matches[matchIdx].scoreHome = scoreHome;
              db.matches[matchIdx].scoreAway = scoreAway;
              updatedCount++;
            }
          }
        }
      }
    }
    
    db.settings.lastAutoUpdate = todayGMT7;
    console.log(`Automatic score updates completed. Updated ${updatedCount} matches.`);
    return { db, updated: updatedCount > 0 };
  } catch (err) {
    console.error('Failed to run automatic score updates:', err);
    return { db, updated: false };
  }
}

export function getCongratulationsData(db) {
  if (!db || !Array.isArray(db.matches) || !Array.isArray(db.predictions) || !Array.isArray(db.users)) {
    return null;
  }
  const finished = db.matches.filter(m => m.scoreHome !== null && m.scoreAway !== null);
  if (finished.length === 0) return null;

  // Find the most recent date of finished matches
  const sortedFinished = [...finished].sort((a, b) => b.datetime.localeCompare(a.datetime));
  const recentDate = sortedFinished[0].date;
  const recentMatches = finished.filter(m => m.date === recentDate);

  const exactWinners = [];
  const outcomeWinners = [];

  recentMatches.forEach(m => {
    const actualOutcome = m.scoreHome > m.scoreAway ? 'home' : (m.scoreHome === m.scoreAway ? 'draw' : 'away');
    const preds = db.predictions.filter(p => p.matchId === m.id);

    preds.forEach(p => {
      const user = db.users.find(u => u.id === p.userId);
      if (!user) return;

      const isExact = p.predictHome === m.scoreHome && p.predictAway === m.scoreAway;
      const predOutcome = p.predictHome > p.predictAway ? 'home' : (p.predictHome === p.predictAway ? 'draw' : 'away');
      const isOutcomeCorrect = predOutcome === actualOutcome;

      const matchName = `${m.teamHome} ${m.scoreHome}-${m.scoreAway} ${m.teamAway}`;

      if (isExact) {
        exactWinners.push({
          userId: user.id,
          displayName: user.displayName,
          username: user.username,
          matchName,
          predictionText: `${p.predictHome}-${p.predictAway}`
        });
      } else if (isOutcomeCorrect) {
        outcomeWinners.push({
          userId: user.id,
          displayName: user.displayName,
          username: user.username,
          matchName,
          predictionText: `${p.predictHome}-${p.predictAway}`
        });
      }
    });
  });

  return {
    recentDate,
    matches: recentMatches.map(m => ({
      id: m.id,
      teamHome: m.teamHome,
      teamAway: m.teamAway,
      scoreHome: m.scoreHome,
      scoreAway: m.scoreAway
    })),
    exactWinners,
    outcomeWinners
  };
}
