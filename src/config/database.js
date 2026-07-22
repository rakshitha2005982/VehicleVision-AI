const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 30000,
});

connection.connect((err) => {
    if (err) {
        console.error("❌ MySQL Connection Failed");
        console.error(err);
        return;
    }

    console.log("✅ MySQL Connected Successfully");
});

module.exports = connection;