#include "db.h"
#include "config.h"
#include <stdio.h>
#include <string.h>
#include <sys/stat.h>
#include <time.h>

LogDB* db_open(const char *db_path) {
    LogDB *logdb = (LogDB*)malloc(sizeof(LogDB));
    if (!logdb) return NULL;

    strncpy(logdb->db_path, db_path, sizeof(logdb->db_path) - 1);
    logdb->rolling_index = 0;

    if (sqlite3_open(db_path, &logdb->db) != SQLITE_OK) {
        fprintf(stderr, "Failed to open database: %s\n", sqlite3_errmsg(logdb->db));
        free(logdb);
        return NULL;
    }

    return logdb;
}

void db_close(LogDB *db) {
    if (db) {
        if (db->db) sqlite3_close(db->db);
        free(db);
    }
}

int db_init_schema(LogDB *db) {
    if (!db || !db->db) return -1;

    const char *sql =
        "CREATE TABLE IF NOT EXISTS traffic_logs ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT,"
        "protocol TEXT NOT NULL,"
        "src_ip TEXT NOT NULL,"
        "src_port INTEGER NOT NULL,"
        "dst_ip TEXT NOT NULL,"
        "dst_port INTEGER NOT NULL,"
        "packets INTEGER NOT NULL,"
        "bytes INTEGER NOT NULL,"
        "timestamp INTEGER NOT NULL,"
        "cpu_id INTEGER DEFAULT 0"
        ");"
        "CREATE INDEX IF NOT EXISTS idx_timestamp ON traffic_logs(timestamp);"
        "CREATE INDEX IF NOT EXISTS idx_src_ip ON traffic_logs(src_ip);"
        "CREATE INDEX IF NOT EXISTS idx_dst_ip ON traffic_logs(dst_ip);";

    char *err_msg = NULL;
    if (sqlite3_exec(db->db, sql, NULL, NULL, &err_msg) != SQLITE_OK) {
        fprintf(stderr, "Failed to create schema: %s\n", err_msg);
        sqlite3_free(err_msg);
        return -1;
    }

    return 0;
}

int db_insert_logs(LogDB *db, TrafficLog *logs, int count) {
    if (!db || !db->db || !logs || count <= 0) return -1;

    sqlite3_exec(db->db, "BEGIN TRANSACTION", NULL, NULL, NULL);

    const char *sql = "INSERT INTO traffic_logs "
                      "(protocol, src_ip, src_port, dst_ip, dst_port, packets, bytes, timestamp, cpu_id) "
                      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    sqlite3_stmt *stmt;
    if (sqlite3_prepare_v2(db->db, sql, -1, &stmt, NULL) != SQLITE_OK) {
        fprintf(stderr, "Failed to prepare statement: %s\n", sqlite3_errmsg(db->db));
        return -1;
    }

    int inserted = 0;
    for (int i = 0; i < count; i++) {
        sqlite3_bind_text(stmt, 1, logs[i].protocol, -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, logs[i].src_ip, -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(stmt, 3, logs[i].src_port);
        sqlite3_bind_text(stmt, 4, logs[i].dst_ip, -1, SQLITE_TRANSIENT);
        sqlite3_bind_int(stmt, 5, logs[i].dst_port);
        sqlite3_bind_int(stmt, 6, logs[i].packets);
        sqlite3_bind_int64(stmt, 7, logs[i].bytes);
        sqlite3_bind_int64(stmt, 8, (sqlite3_int64)logs[i].timestamp);
        sqlite3_bind_int(stmt, 9, logs[i].cpu_id);

        if (sqlite3_step(stmt) == SQLITE_DONE) {
            inserted++;
        }
        sqlite3_reset(stmt);
    }

    sqlite3_finalize(stmt);
    sqlite3_exec(db->db, "COMMIT", NULL, NULL, NULL);

    return inserted;
}

long db_get_file_size(const char *filepath) {
    struct stat st;
    if (stat(filepath, &st) == 0) {
        return st.st_size;
    }
    return 0;
}

int db_check_and_roll(LogDB *db, int max_size_mb) {
    if (!db) return -1;

    long size_bytes = db_get_file_size(db->db_path);
    long max_bytes = (long)max_size_mb * 1024 * 1024;

    if (size_bytes < max_bytes) return 0; // No need to roll

    // Close current DB
    sqlite3_close(db->db);

    // Generate new DB filename with timestamp
    char new_path[512];
    time_t now = time(NULL);
    snprintf(new_path, sizeof(new_path), "%s%ld.db", DB_ROLLING_PREFIX, now);

    // Rename current DB
    rename(db->db_path, new_path);

    // Open new DB
    if (sqlite3_open(db->db_path, &db->db) != SQLITE_OK) {
        fprintf(stderr, "Failed to open new DB after rolling: %s\n", sqlite3_errmsg(db->db));
        return -1;
    }

    // Initialize schema in new DB
    db_init_schema(db);
    db->rolling_index++;

    printf("Database rolled: %s -> %s\n", db->db_path, new_path);
    return 1;
}
