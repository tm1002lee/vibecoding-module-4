#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <unistd.h>
#include <string.h>
#include "config.h"
#include "cache.h"
#include "db.h"
#include "generator.h"

// Global state
static volatile int running = 1;
static LogCache *cache = NULL;
static LogDB *db = NULL;

void signal_handler(int signum) {
    printf("\nReceived signal %d, shutting down...\n", signum);
    running = 0;
}

void cleanup(void) {
    // Flush remaining cache to DB
    if (cache && db && cache->count > 0) {
        printf("Flushing %d logs to database...\n", cache->count);
        db_insert_logs(db, cache->logs, cache->count);
    }

    // Cleanup resources
    if (cache) cache_destroy(cache);
    if (db) db_close(db);

    // Remove temp file
    remove(TEMP_FILE_PATH);

    printf("Cleanup completed.\n");
}

int main(int argc, char *argv[]) {
    printf("=== LogCollector Daemon ===\n");
    printf("Cache threshold: %d logs\n", CACHE_SIZE_THRESHOLD);
    printf("DB path: %s\n", DB_PATH);
    printf("Generate interval: %d ms\n", GEN_INTERVAL_MS);
    printf("Batch size: %d logs\n\n", GEN_BATCH_SIZE);

    // Setup signal handlers
    signal(SIGINT, signal_handler);
    signal(SIGTERM, signal_handler);

    // Initialize generator
    generator_init();

    // Create cache
    cache = cache_create(CACHE_SIZE_THRESHOLD * 2);
    if (!cache) {
        fprintf(stderr, "Failed to create cache\n");
        return 1;
    }

    // Open database
    db = db_open(DB_PATH);
    if (!db) {
        fprintf(stderr, "Failed to open database\n");
        cache_destroy(cache);
        return 1;
    }

    // Initialize DB schema
    if (db_init_schema(db) != 0) {
        fprintf(stderr, "Failed to initialize database schema\n");
        cleanup();
        return 1;
    }

    // Load any existing temp cache
    int loaded = cache_load_from_file(cache, TEMP_FILE_PATH);
    if (loaded > 0) {
        printf("Loaded %d logs from temp file\n", loaded);
        remove(TEMP_FILE_PATH);
    }

    printf("Starting log collection...\n\n");

    int total_generated = 0;
    int total_flushed = 0;

    // Main loop
    while (running) {
        // Generate batch of logs
        TrafficLog batch[GEN_BATCH_SIZE];
        generator_create_batch(batch, GEN_BATCH_SIZE);

        // Add to cache
        for (int i = 0; i < GEN_BATCH_SIZE; i++) {
            if (cache_add(cache, &batch[i]) != 0) {
                fprintf(stderr, "Cache full, attempting flush...\n");
                break;
            }
        }

        total_generated += GEN_BATCH_SIZE;

        // Check if cache needs flushing
        if (cache->count >= CACHE_SIZE_THRESHOLD) {
            printf("Cache threshold reached (%d logs), flushing to DB...\n", cache->count);

            int inserted = db_insert_logs(db, cache->logs, cache->count);
            if (inserted > 0) {
                total_flushed += inserted;
                printf("Inserted %d logs to DB (total: %d generated, %d flushed)\n",
                       inserted, total_generated, total_flushed);
                cache_clear(cache);
            } else {
                fprintf(stderr, "DB insert failed, saving to temp file...\n");
                cache_flush_to_file(cache, TEMP_FILE_PATH);
                cache_clear(cache);
            }

            // Check if DB needs rolling
            db_check_and_roll(db, DB_MAX_SIZE_MB);
        }

        // Sleep
        usleep(GEN_INTERVAL_MS * 1000);
    }

    printf("\nStopping... Total generated: %d, Total flushed: %d\n",
           total_generated, total_flushed);

    cleanup();
    return 0;
}
