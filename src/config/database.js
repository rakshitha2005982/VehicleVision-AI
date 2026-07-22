const mysql = require("mysql2");

const memoryStore = new Map();
let useFallbackStorage = false;

const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "vehiclevision",
    connectTimeout: 30000,
});

const createRecord = (processingId, defaults = {}) => {
    const existing = memoryStore.get(processingId);

    if (existing) {
        return existing;
    }

    const record = {
        processing_id: processingId,
        original_name: null,
        stored_name: null,
        file_path: null,
        status: "pending",
        vehicle_number: null,
        width: null,
        height: null,
        brightness_score: null,
        blur_score: null,
        screenshot_detected: null,
        metadata_json: null,
        confidence_score: null,
        image_hash: null,
        created_at: new Date().toISOString(),
        ...defaults,
    };

    memoryStore.set(processingId, record);
    return record;
};

const handleFallbackQuery = (sql, params, callback) => {
    const normalizedSql = sql.replace(/\s+/g, " ").trim().toUpperCase();

    try {
        if (normalizedSql.startsWith("INSERT INTO IMAGES")) {
            const [processingId, originalName, storedName, filePath, status] = params;
            const record = createRecord(processingId, {
                original_name: originalName,
                stored_name: storedName,
                file_path: filePath,
                status,
            });

            if (callback) {
                callback(null, { insertId: record.processing_id });
            }
            return;
        }

        if (normalizedSql.startsWith("UPDATE IMAGES")) {
            const processingId = params[params.length - 1];
            const record = createRecord(processingId);

            if (normalizedSql.includes("SET STATUS")) {
                record.status = params[0];
            }

            if (normalizedSql.includes("SET VEHICLE_NUMBER")) {
                record.vehicle_number = params[0];
            }

            if (normalizedSql.includes("SET IMAGE_HASH")) {
                record.image_hash = params[0];
            }

            if (normalizedSql.includes("SET WIDTH =")) {
                record.width = params[0];
                record.height = params[1];
                record.brightness_score = params[2];
                record.blur_score = params[3];
                record.screenshot_detected = params[4];
                record.metadata_json = params[5];
                record.confidence_score = params[6];
            }

            if (callback) {
                callback(null, { affectedRows: 1 });
            }
            return;
        }

        if (normalizedSql.startsWith("SELECT PROCESSING_ID, STATUS FROM IMAGES")) {
            const processingId = params[0];
            const record = memoryStore.get(processingId);

            if (callback) {
                callback(null, record ? [{ processing_id: record.processing_id, status: record.status }] : []);
            }
            return;
        }

        if (normalizedSql.startsWith("SELECT * FROM IMAGES")) {
            const processingId = params[0];
            const record = memoryStore.get(processingId);

            if (callback) {
                callback(null, record ? [record] : []);
            }
            return;
        }

        if (normalizedSql.startsWith("SELECT PROCESSING_ID FROM IMAGES")) {
            const imageHash = params[0];
            const matches = Array.from(memoryStore.values())
                .filter((item) => item.image_hash === imageHash)
                .map((item) => ({ processing_id: item.processing_id }));

            if (callback) {
                callback(null, matches);
            }
            return;
        }
    } catch (error) {
        if (callback) {
            callback(error);
        }
        return;
    }

    if (callback) {
        callback(null, []);
    }
};

const query = (sql, params, callback) => {
    if (typeof params === "function") {
        callback = params;
        params = [];
    }

    if (useFallbackStorage) {
        return handleFallbackQuery(sql, params, callback);
    }

    return connection.query(sql, params, (err, result) => {
        if (err) {
            console.warn("⚠️ Falling back to in-memory storage because MySQL is unavailable.");
            useFallbackStorage = true;
            return handleFallbackQuery(sql, params, callback);
        }

        if (callback) {
            callback(null, result);
        }
    });
};

connection.connect((err) => {
    if (err) {
        console.warn("⚠️ MySQL not available. Using in-memory storage instead.");
        useFallbackStorage = true;
        return;
    }

    console.log("✅ MySQL Connected Successfully");
});

module.exports = {
    query,
    connection,
    useFallbackStorage: () => useFallbackStorage,
};