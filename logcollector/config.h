#ifndef CONFIG_H
#define CONFIG_H

// Cache configuration
#define CACHE_SIZE_THRESHOLD 10000      // Number of logs before flushing to DB
#define TEMP_FILE_PATH "./cache_temp.dat"

// Database configuration
#define DB_PATH "./logs.db"
#define DB_MAX_SIZE_MB 100              // Max DB file size before rolling
#define DB_ROLLING_PREFIX "logs_"       // Prefix for rolled DB files

// Generator configuration
#define GEN_INTERVAL_MS 100             // Generate logs every 100ms
#define GEN_BATCH_SIZE 10               // Generate 10 logs per batch

// Daemon configuration
#define PID_FILE "./logcollector.pid"
#define LOG_FILE "./logcollector.log"

#endif // CONFIG_H
