import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'progress_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default data
const DEFAULT_CLASSES = [
  { id: 'P', name: 'P반', color: 'indigo', schedule: { 1: ['4교시'], 2: ['7교시'], 3: ['3교시'], 5: ['6교시'] } },
  { id: 'R', name: 'R반', color: 'emerald', schedule: { 1: ['6교시'], 3: ['1교시'], 4: ['7교시'], 5: ['4교시'] } },
  { id: 'S', name: 'S반', color: 'amber', schedule: { 2: ['2교시', '3교시'], 4: ['2교시', '3교시'] } }
];

const INITIAL_DATA = {
  subjectName: '인공지능기초',
  teacherName: '홍길동 교사',
  schoolYear: '2026학년도 2학기',
  startDate: '2026-08-10',
  endDate: '2026-12-31',
  classes: DEFAULT_CLASSES,
  progressData: {},
  planData: {},
  customExclusions: {},
  lastSavedAt: new Date().toISOString()
};

// Helper: Read DB
function readDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading database file:', error);
    return INITIAL_DATA;
  }
}

// Helper: Write DB
function writeDatabase(data: any) {
  try {
    const updated = {
      ...data,
      lastSavedAt: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (error) {
    console.error('Error writing database file:', error);
    throw error;
  }
}

// ================= API Routes =================

// GET Database Data
app.get('/api/progress', (req, res) => {
  const data = readDatabase();
  res.json({ success: true, data });
});

// POST Save / Update Database
app.post('/api/progress', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ success: false, error: 'Invalid data format' });
      return;
    }
    const updated = writeDatabase(payload);
    res.json({ success: true, message: '저장 완료 (DB 동기화)', lastSavedAt: updated.lastSavedAt });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || '저장 실패' });
  }
});

// POST Reset Database
app.post('/api/progress/reset', (req, res) => {
  try {
    const resetData = {
      ...INITIAL_DATA,
      lastSavedAt: new Date().toISOString()
    };
    writeDatabase(resetData);
    res.json({ success: true, message: '기본 데이터로 초기화되었습니다.', data: resetData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ================= Vite Middleware / Static =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
