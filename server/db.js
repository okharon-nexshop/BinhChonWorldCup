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

// World Cup 2026 Knockout stage matches (73 to 104)
const knockoutMatches = [
  { id: "match_73", num: 73, group: "Round of 32", date: "28/06", time: "12:00", datetime: "2026-06-28T12:00:00+07:00", teamHome: "2A", teamAway: "2B", scoreHome: null, scoreAway: null },
  { id: "match_74", num: 74, group: "Round of 32", date: "29/06", time: "16:30", datetime: "2026-06-29T16:30:00+07:00", teamHome: "1E", teamAway: "3A/B/C/D/F", scoreHome: null, scoreAway: null },
  { id: "match_75", num: 75, group: "Round of 32", date: "29/06", time: "19:00", datetime: "2026-06-29T19:00:00+07:00", teamHome: "1F", teamAway: "2C", scoreHome: null, scoreAway: null },
  { id: "match_76", num: 76, group: "Round of 32", date: "29/06", time: "12:00", datetime: "2026-06-29T12:00:00+07:00", teamHome: "1C", teamAway: "2F", scoreHome: null, scoreAway: null },
  { id: "match_77", num: 77, group: "Round of 32", date: "30/06", time: "17:00", datetime: "2026-06-30T17:00:00+07:00", teamHome: "1I", teamAway: "3C/D/F/G/H", scoreHome: null, scoreAway: null },
  { id: "match_78", num: 78, group: "Round of 32", date: "30/06", time: "12:00", datetime: "2026-06-30T12:00:00+07:00", teamHome: "2E", teamAway: "2I", scoreHome: null, scoreAway: null },
  { id: "match_79", num: 79, group: "Round of 32", date: "30/06", time: "19:00", datetime: "2026-06-30T19:00:00+07:00", teamHome: "1A", teamAway: "3C/E/F/H/I", scoreHome: null, scoreAway: null },
  { id: "match_80", num: 80, group: "Round of 32", date: "01/07", time: "12:00", datetime: "2026-07-01T12:00:00+07:00", teamHome: "1L", teamAway: "3E/H/I/J/K", scoreHome: null, scoreAway: null },
  { id: "match_81", num: 81, group: "Round of 32", date: "01/07", time: "17:00", datetime: "2026-07-01T17:00:00+07:00", teamHome: "1D", teamAway: "3B/E/F/I/J", scoreHome: null, scoreAway: null },
  { id: "match_82", num: 82, group: "Round of 32", date: "01/07", time: "13:00", datetime: "2026-07-01T13:00:00+07:00", teamHome: "1G", teamAway: "3A/E/H/I/J", scoreHome: null, scoreAway: null },
  { id: "match_83", num: 83, group: "Round of 32", date: "02/07", time: "19:00", datetime: "2026-07-02T19:00:00+07:00", teamHome: "2K", teamAway: "2L", scoreHome: null, scoreAway: null },
  { id: "match_84", num: 84, group: "Round of 32", date: "02/07", time: "12:00", datetime: "2026-07-02T12:00:00+07:00", teamHome: "1H", teamAway: "2J", scoreHome: null, scoreAway: null },
  { id: "match_85", num: 85, group: "Round of 32", date: "02/07", time: "20:00", datetime: "2026-07-02T20:00:00+07:00", teamHome: "1B", teamAway: "3E/F/G/I/J", scoreHome: null, scoreAway: null },
  { id: "match_86", num: 86, group: "Round of 32", date: "03/07", time: "18:00", datetime: "2026-07-03T18:00:00+07:00", teamHome: "1J", teamAway: "2H", scoreHome: null, scoreAway: null },
  { id: "match_87", num: 87, group: "Round of 32", date: "03/07", time: "20:30", datetime: "2026-07-03T20:30:00+07:00", teamHome: "1K", teamAway: "3D/E/I/J/L", scoreHome: null, scoreAway: null },
  { id: "match_88", num: 88, group: "Round of 32", date: "03/07", time: "13:00", datetime: "2026-07-03T13:00:00+07:00", teamHome: "2D", teamAway: "2G", scoreHome: null, scoreAway: null },
  { id: "match_89", num: 89, group: "Round of 16", date: "04/07", time: "17:00", datetime: "2026-07-04T17:00:00+07:00", teamHome: "W74", teamAway: "W77", scoreHome: null, scoreAway: null },
  { id: "match_90", num: 90, group: "Round of 16", date: "04/07", time: "12:00", datetime: "2026-07-04T12:00:00+07:00", teamHome: "W73", teamAway: "W75", scoreHome: null, scoreAway: null },
  { id: "match_91", num: 91, group: "Round of 16", date: "05/07", time: "16:00", datetime: "2026-07-05T16:00:00+07:00", teamHome: "W76", teamAway: "W78", scoreHome: null, scoreAway: null },
  { id: "match_92", num: 92, group: "Round of 16", date: "05/07", time: "18:00", datetime: "2026-07-05T18:00:00+07:00", teamHome: "W79", teamAway: "W80", scoreHome: null, scoreAway: null },
  { id: "match_93", num: 93, group: "Round of 16", date: "06/07", time: "14:00", datetime: "2026-07-06T14:00:00+07:00", teamHome: "W83", teamAway: "W84", scoreHome: null, scoreAway: null },
  { id: "match_94", num: 94, group: "Round of 16", date: "06/07", time: "17:00", datetime: "2026-07-06T17:00:00+07:00", teamHome: "W81", teamAway: "W82", scoreHome: null, scoreAway: null },
  { id: "match_95", num: 95, group: "Round of 16", date: "07/07", time: "12:00", datetime: "2026-07-07T12:00:00+07:00", teamHome: "W86", teamAway: "W88", scoreHome: null, scoreAway: null },
  { id: "match_96", num: 96, group: "Round of 16", date: "07/07", time: "13:00", datetime: "2026-07-07T13:00:00+07:00", teamHome: "W85", teamAway: "W87", scoreHome: null, scoreAway: null },
  { id: "match_97", num: 97, group: "Quarter-final", date: "09/07", time: "16:00", datetime: "2026-07-09T16:00:00+07:00", teamHome: "W89", teamAway: "W90", scoreHome: null, scoreAway: null },
  { id: "match_98", num: 98, group: "Quarter-final", date: "10/07", time: "12:00", datetime: "2026-07-10T12:00:00+07:00", teamHome: "W93", teamAway: "W94", scoreHome: null, scoreAway: null },
  { id: "match_99", num: 99, group: "Quarter-final", date: "11/07", time: "17:00", datetime: "2026-07-11T17:00:00+07:00", teamHome: "W91", teamAway: "W92", scoreHome: null, scoreAway: null },
  { id: "match_100", num: 100, group: "Quarter-final", date: "11/07", time: "20:00", datetime: "2026-07-11T20:00:00+07:00", teamHome: "W95", teamAway: "W96", scoreHome: null, scoreAway: null },
  { id: "match_101", num: 101, group: "Semi-final", date: "14/07", time: "14:00", datetime: "2026-07-14T14:00:00+07:00", teamHome: "W97", teamAway: "W98", scoreHome: null, scoreAway: null },
  { id: "match_102", num: 102, group: "Semi-final", date: "15/07", time: "15:00", datetime: "2026-07-15T15:00:00+07:00", teamHome: "W99", teamAway: "W100", scoreHome: null, scoreAway: null },
  { id: "match_103", num: 103, group: "Match for third place", date: "18/07", time: "17:00", datetime: "2026-07-18T17:00:00+07:00", teamHome: "L101", teamAway: "L102", scoreHome: null, scoreAway: null },
  { id: "match_104", num: 104, group: "Final", date: "19/07", time: "15:00", datetime: "2026-07-19T15:00:00+07:00", teamHome: "W101", teamAway: "W102", scoreHome: null, scoreAway: null }
];

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
  matches: [...seededMatches, ...knockoutMatches],
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
    // Seed knockout matches if they don't exist yet (migration for existing db)
    if (db.matches.length < 104) {
      for (const ko of knockoutMatches) {
        if (!db.matches.some(m => m.id === ko.id)) {
          db.matches.push(ko);
          needsMigration = true;
        }
      }
    }

    db.matches = db.matches.map(m => {
      let updated = false;
      let teamHome = m.teamHome;
      let teamAway = m.teamAway;
      let scoreHome = m.scoreHome;
      let scoreAway = m.scoreAway;

      // 1. Migrate TBD team names (only group stage matches)
      if (!m.num) {
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

export async function autoUpdateScores(db, force = false) {
  if (!db.settings) {
    db.settings = {};
  }
  
  const now = Date.now();
  
  // Check if any match is currently "live" (started, within 2.5 hours, and score not yet confirmed)
  const hasLiveMatch = Array.isArray(db.matches) && db.matches.some(m => {
    if (!m.datetime || m.scoreHome !== null) return false;
    const kickoff = new Date(m.datetime).getTime();
    return now >= kickoff && now <= kickoff + 2.5 * 60 * 60 * 1000;
  });

  const refreshInterval = hasLiveMatch ? 60 * 1000 : 10 * 60 * 1000; // 1 min if live, 10 mins otherwise
  
  if (!force && db.settings.lastAutoUpdateTimestamp && (now - db.settings.lastAutoUpdateTimestamp < refreshInterval)) {
    return { db, updated: false };
  }
  
  // Today's date in GMT+7
  const todayGMT7 = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  console.log(`Checking for automatic match score updates for ${todayGMT7} (force=${force})...`);
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
    
    // Translation helper for team names & placeholders
    const translateTeamName = (name) => {
      if (!name) return '';
      if (teamTranslation[name]) return teamTranslation[name];
      
      // Placeholders: Wxx -> Thắng Trận xx, Lxx -> Thua Trận xx
      if (name.startsWith('W') && !isNaN(name.substring(1))) {
        return `Thắng Trận ${name.substring(1)}`;
      }
      if (name.startsWith('L') && !isNaN(name.substring(1))) {
        return `Thua Trận ${name.substring(1)}`;
      }
      // Group placeholders: 1A, 2B, 3A/B...
      if (/^[123][A-L]/.test(name)) {
        const rank = name[0] === '1' ? 'Nhất' : (name[0] === '2' ? 'Nhì' : 'Hạng 3');
        const groupName = name.substring(1);
        return `${rank} ${groupName}`;
      }
      return name;
    };

    for (const item of data.matches) {
      const homeEng = item.team1;
      const awayEng = item.team2;
      
      const homeViet = translateTeamName(homeEng);
      const awayViet = translateTeamName(awayEng);
      
      if (item.num !== undefined) {
        // Knockout match: locate by match number
        const matchId = `match_${item.num}`;
        const matchIdx = db.matches.findIndex(m => m.id === matchId);
        if (matchIdx !== -1) {
          const m = db.matches[matchIdx];
          let changed = false;
          
          if (m.teamHome !== homeViet) {
            db.matches[matchIdx].teamHome = homeViet;
            changed = true;
          }
          if (m.teamAway !== awayViet) {
            db.matches[matchIdx].teamAway = awayViet;
            changed = true;
          }
          
          if (item.score && Array.isArray(item.score.ft)) {
            const scoreHome = item.score.ft[0];
            const scoreAway = item.score.ft[1];
            if (m.scoreHome !== scoreHome || m.scoreAway !== scoreAway) {
              db.matches[matchIdx].scoreHome = scoreHome;
              db.matches[matchIdx].scoreAway = scoreAway;
              changed = true;
            }
          }
          
          if (changed) {
            updatedCount++;
          }
        }
      } else {
        // Group match: locate by team names
        if (item.score && Array.isArray(item.score.ft)) {
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
    }
    
    db.settings.lastAutoUpdate = todayGMT7;
    db.settings.lastAutoUpdateTimestamp = now;
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
