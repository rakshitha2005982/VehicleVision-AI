const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "#Rakshitha2005",   // Put your actual MySQL password here
  database: "vehiclevision",
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