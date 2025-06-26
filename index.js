import express from 'express';
import session from 'express-session';
import multer from 'multer';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import Razorpay from 'razorpay';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));


app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Razorpay instance
const razorpay = new Razorpay({
  key_id: 'rzp_test_abc123XYZ',
  key_secret: 'yoursecretkey123',
});


const dbPath = path.join(__dirname, 'bookings.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      applicationID TEXT,
      hall TEXT,
      date TEXT,
      name TEXT,
      address TEXT,
      mobile TEXT,
      email TEXT,
      bcclID TEXT,
      adhaar TEXT,
      purpose TEXT,
      purposeDetail TEXT,
      adhaarDependent TEXT,
      file1 TEXT,
      file2 TEXT,
      status TEXT DEFAULT 'Pending'
    )`);
  }
});


app.post('/create-payment', (req, res) => {
  const { appID, name, email } = req.body;
  res.json({
    success: true,
    paymentUrl: '/paysuccess.html'
  });
});


app.post('/submit/', upload.fields([{ name: 'File1' }, { name: 'File2' }]), (req, res) => {
  const data = {
    applicationID: req.body.ApplicationID,
    hall: req.body.Halls,
    date: req.body.Date,
    name: req.body.Name,
    address: req.body.Address,
    mobile: req.body.Mobile,
    email: req.body.Email,
    bcclID: req.body.BCCLID || 'N/A',
    adhaar: req.body.Adhaar || 'N/A',
    purpose: req.body.Option,
    purposeDetail: req.body.purposeDetail || 'N/A',
    adhaarDependent: req.body.adhaarDependent || 'N/A',
    file1: req.files.File1 ? req.files.File1[0].filename : 'None',
    file2: req.files.File2 ? req.files.File2[0].filename : 'None',
  };

  const bookingDate = new Date(data.date);
  const yesterday = new Date(bookingDate);
  yesterday.setDate(bookingDate.getDate() - 1);

  const dateStr = bookingDate.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

if (data.adhaar && data.adhaar.trim().length > 0 && data.adhaar !== 'N/A') {
  const checkQuery = `
    SELECT * FROM bookings 
    WHERE adhaar = ? 
      AND date IN (?, ?)
  `;

  db.get(checkQuery, [data.adhaar, dateStr, yesterdayStr], (err, row) => {
    if (err) {
      console.error('Error checking Aadhaar history:', err);
      return res.status(500).send('Database error');
    }

    if (row) {
      return res.status(400).send(
        'Can not Book for consecutive days with the same Adhaar number.'
      );
    }

    insertBooking();
  });
} else {
  insertBooking();
}

  function insertBooking() {
    const stmt = db.prepare(`INSERT INTO bookings (
      applicationID, hall, date, name, address, mobile, email, bcclID, adhaar,
      purpose, purposeDetail, adhaarDependent, file1, file2
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    stmt.run(
      data.applicationID,
      data.hall,
      data.date,
      data.name,
      data.address,
      data.mobile,
      data.email,
      data.bcclID,
      data.adhaar,
      data.purpose,
      data.purposeDetail,
      data.adhaarDependent,
      data.file1,
      data.file2,
      function (err) {
        if (err) {
          console.error(err.message);
          res.status(500).send('Database error');
        } else {
          res.redirect(`/details.html?${new URLSearchParams(data).toString()}`);
        }
      }
    );
  }
});

// Admin credentials
const ADMIN_EMAIL = 'admin@bccl.com';
const ADMIN_PASSWORD = 'admin123';


app.post('/admin/login', (req, res) => {
  const { Username, Password } = req.body;
  if (Username === ADMIN_EMAIL && Password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.redirect('/admindash.html');
  } else {
    res.status(401).send('Invalid credentials');
  }
});


app.use('/admindash.html', (req, res, next) => {
  if (req.session.isAdmin) next();
  else res.redirect('/admin-login.html');
});


app.get('/admin/data', (req, res) => {
  const status = req.query.status;

  let query = 'SELECT * FROM bookings';
  const params = [];

  if (status === 'Pending' || status === 'Approved' || status === 'Rejected') {
    query += ' WHERE status = ?';
    params.push(status);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Database error');
    } else {
      res.json(rows);
    }
  });
});



app.post('/admin/update', (req, res) => {
  const { id, status } = req.body;
  db.run(`UPDATE bookings SET status = ? WHERE id = ?`, [status, id], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Database error');
    } else {
      res.send('Status updated');
    }
  });
});


app.get('/check-status', (req, res) => {
  const applicationID = req.query.applicationID;
  db.get(`SELECT status FROM bookings WHERE applicationID = ?`, [applicationID], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ found: false });
    }
    if (row) {
      res.json({ found: true, status: row.status });
    } else {
      res.json({ found: false });
    }
  });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
