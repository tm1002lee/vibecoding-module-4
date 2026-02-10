#ifndef DB_H
#define DB_H

#include "cache.h"
#include <sqlite3.h>

// Database management
typedef struct {
    sqlite3 *db;
    char db_path[256];
    int rolling_index;
} LogDB;

// Function prototypes
LogDB* db_open(const char *db_path);
void db_close(LogDB *db);
int db_init_schema(LogDB *db);
int db_insert_logs(LogDB *db, TrafficLog *logs, int count);
int db_check_and_roll(LogDB *db, int max_size_mb);
long db_get_file_size(const char *filepath);

#endif // DB_H
