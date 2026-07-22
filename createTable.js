require("dotenv").config();

const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Connection Failed");
    console.error(err);
    return;
  }

  console.log("✅ Connected to MySQL");

  const sql = `
    CREATE TABLE IF NOT EXISTS images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      processing_id VARCHAR(255) UNIQUE,
      original_name VARCHAR(255),
      stored_name VARCHAR(255),
      file_path TEXT,
      status VARCHAR(50),
      vehicle_number VARCHAR(50),
      width INT,
      height INT,
      brightness_score FLOAT,
      blur_score FLOAT,
      screenshot_detected BOOLEAN,
      metadata_json JSON,
      confidence_score FLOAT,
      image_hash VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  connection.query(sql, (err) => {
    if (err) {
      console.error("❌ Table creation failed");
      console.error(err);
    } else {
      console.log("✅ images table created successfully!");
    }

    connection.end();
  });
});