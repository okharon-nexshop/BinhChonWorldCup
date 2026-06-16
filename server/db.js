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
  { group: 'Bảng A', date: '12/06', time: '02:00', teamHome: 'Mexico', teamAway: 'Nam Phi' },
  { group: 'Bảng A', date: '12/06', time: '09:00', teamHome: 'Hàn Quốc', teamAway: 'Cộng hòa Séc' },
  { group: 'Bảng A', date: '18/06', time: '23:00', teamHome: 'Cộng hòa Séc', teamAway: 'Nam Phi' },
  { group: 'Bảng A', date: '19/06', time: '08:00', teamHome: 'Mexico', teamAway: 'Hàn Quốc' },
  { group: 'Bảng A', date: '25/06', time: '08:00', teamHome: 'Nam Phi', teamAway: 'Hàn Quốc' },
  { group: 'Bảng A', date: '25/06', time: '08:00', teamHome: 'Cộng hòa Séc', teamAway: 'Mexico' },
  // Bảng B
  { group: 'Bảng B', date: '13/06', time: '02:00', teamHome: 'Canada', teamAway: 'Bosnia' },
  { group: 'Bảng B', date: '14/06', time: '02:00', teamHome: 'Qatar', teamAway: 'Thụy Sĩ' },
  { group: 'Bảng B', date: '19/06', time: '02:00', teamHome: 'Thụy Sĩ', teamAway: 'Bosnia' },
  { group: 'Bảng B', date: '19/06', time: '05:00', teamHome: 'Canada', teamAway: 'Qatar' },
  { group: 'Bảng B', date: '25/06', time: '02:00', teamHome: 'Thụy Sĩ', teamAway: 'Canada' },
  { group: 'Bảng B', date: '25/06', time: '02:00', teamHome: 'Bosnia', teamAway: 'Qatar' },
  // Bảng C
  { group: 'Bảng C', date: '14/06', time: '05:00', teamHome: 'Brazil', teamAway: 'Morocco' },
  { group: 'Bảng C', date: '14/06', time: '08:00', teamHome: 'Haiti', teamAway: 'Scotland' },
  { group: 'Bảng C', date: '20/06', time: '05:00', teamHome: 'Scotland', teamAway: 'Morocco' },
  { group: 'Bảng C', date: '20/06', time: '08:00', teamHome: 'Brazil', teamAway: 'Haiti' },
  { group: 'Bảng C', date: '25/06', time: '05:00', teamHome: 'Morocco', teamAway: 'Haiti' },
  { group: 'Bảng C', date: '25/06', time: '05:00', teamHome: 'Scotland', teamAway: 'Brazil' },
  // Bảng D
  { group: 'Bảng D', date: '13/06', time: '08:00', teamHome: 'Mỹ', teamAway: 'Paraguay' },
  { group: 'Bảng D', date: '14/06', time: '11:00', teamHome: 'Úc', teamAway: 'Thổ Nhĩ Kỳ' },
  { group: 'Bảng D', date: '20/06', time: '02:00', teamHome: 'Mỹ', teamAway: 'Úc' },
  { group: 'Bảng D', date: '20/06', time: '11:00', teamHome: 'Thổ Nhĩ Kỳ', teamAway: 'Paraguay' },
  { group: 'Bảng D', date: '26/06', time: '09:00', teamHome: 'Mỹ', teamAway: 'Thổ Nhĩ Kỳ' },
  { group: 'Bảng D', date: '26/06', time: '09:00', teamHome: 'Paraguay', teamAway: 'Úc' },
  // Bảng E
  { group: 'Bảng E', date: '15/06', time: '00:00', teamHome: 'Đức', teamAway: 'Curaçao' },
  { group: 'Bảng E', date: '15/06', time: '06:00', teamHome: 'Bờ Biển Ngà', teamAway: 'Ecuador' },
  { group: 'Bảng E', date: '21/06', time: '03:00', teamHome: 'Đức', teamAway: 'Bờ Biển Ngà' },
  { group: 'Bảng E', date: '21/06', time: '07:00', teamHome: 'Ecuador', teamAway: 'Curaçao' },
  { group: 'Bảng E', date: '26/06', time: '03:00', teamHome: 'Ecuador', teamAway: 'Đức' },
  { group: 'Bảng E', date: '26/06', time: '03:00', teamHome: 'Curaçao', teamAway: 'Bờ Biển Ngà' },
  // Bảng F
  { group: 'Bảng F', date: '15/06', time: '03:00', teamHome: 'Hà Lan', teamAway: 'Nhật Bản' },
  { group: 'Bảng F', date: '15/06', time: '09:00', teamHome: 'Thụy Điển', teamAway: 'Tunisia' },
  { group: 'Bảng F', date: '21/06', time: '00:00', teamHome: 'Hà Lan', teamAway: 'Thụy Điển' },
  { group: 'Bảng F', date: '21/06', time: '11:00', teamHome: 'Tunisia', teamAway: 'Nhật Bản' },
  { group: 'Bảng F', date: '26/06', time: '06:00', teamHome: 'Nhật Bản', teamAway: 'Thụy Điển' },
  { group: 'Bảng F', date: '26/06', time: '06:00', teamHome: 'Tunisia', teamAway: 'Hà Lan' },
  // Bảng G
  { group: 'Bảng G', date: '16/06', time: '02:00', teamHome: 'Bỉ', teamAway: 'Ai Cập' },
  { group: 'Bảng G', date: '16/06', time: '08:00', teamHome: 'Iran', teamAway: 'New Zealand' },
  { group: 'Bảng G', date: '22/06', time: '02:00', teamHome: 'Bỉ', teamAway: 'Iran' },
  { group: 'Bảng G', date: '22/06', time: '08:00', teamHome: 'New Zealand', teamAway: 'Ai Cập' },
  { group: 'Bảng G', date: '27/06', time: '10:00', teamHome: 'New Zealand', teamAway: 'Bỉ' },
  { group: 'Bảng G', date: '27/06', time: '10:00', teamHome: 'Ai Cập', teamAway: 'Iran' },
  // Bảng H
  { group: 'Bảng H', date: '15/06', time: '23:00', teamHome: 'Tây Ban Nha', teamAway: 'Cape Verde' },
  { group: 'Bảng H', date: '16/06', time: '05:00', teamHome: 'Ả Rập Xê Út', teamAway: 'Uruguay' },
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
  scoreHome: null,
  scoreAway: null
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
      if (teamHome === 'TBD' && tbdMapping[m.group]) {
        teamHome = tbdMapping[m.group];
        updated = true;
      }
      if (teamAway === 'TBD' && tbdMapping[m.group]) {
        teamAway = tbdMapping[m.group];
        updated = true;
      }
      if (updated) {
        needsMigration = true;
        return { ...m, teamHome, teamAway };
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
      const { db: migratedDB, needsMigration } = migrateDatabase(rest);
      if (needsMigration) {
        console.log('Migrating TBD matches in MongoDB...');
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
    const { db: migratedDB, needsMigration } = migrateDatabase(parsed);
    if (needsMigration) {
      console.log('Migrating TBD matches in local JSON...');
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
    writeQueue = writeQueue.then(async () => {
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
    });
    return writeQueue;
  }

  // Local fallback
  writeQueue = writeQueue.then(async () => {
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
