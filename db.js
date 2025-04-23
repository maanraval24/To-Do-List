// db.js
const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'shreeji88',
  database: 'taskflow'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected!');
});

module.exports = db;

    