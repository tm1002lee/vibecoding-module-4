#include "cache.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

LogCache* cache_create(int capacity) {
    LogCache *cache = (LogCache*)malloc(sizeof(LogCache));
    if (!cache) return NULL;

    cache->logs = (TrafficLog*)malloc(sizeof(TrafficLog) * capacity);
    if (!cache->logs) {
        free(cache);
        return NULL;
    }

    cache->count = 0;
    cache->capacity = capacity;
    return cache;
}

void cache_destroy(LogCache *cache) {
    if (cache) {
        if (cache->logs) free(cache->logs);
        free(cache);
    }
}

int cache_add(LogCache *cache, TrafficLog *log) {
    if (!cache || !log) return -1;
    if (cache->count >= cache->capacity) return -2; // Cache full

    memcpy(&cache->logs[cache->count], log, sizeof(TrafficLog));
    cache->count++;
    return 0;
}

int cache_flush_to_file(LogCache *cache, const char *filepath) {
    if (!cache || cache->count == 0) return 0;

    FILE *fp = fopen(filepath, "ab"); // Append mode
    if (!fp) return -1;

    size_t written = fwrite(cache->logs, sizeof(TrafficLog), cache->count, fp);
    fclose(fp);

    if (written != cache->count) return -2;

    cache->count = 0; // Clear cache after flush
    return written;
}

int cache_load_from_file(LogCache *cache, const char *filepath) {
    if (!cache) return -1;

    FILE *fp = fopen(filepath, "rb");
    if (!fp) return 0; // File doesn't exist, not an error

    int loaded = 0;
    TrafficLog log;

    while (fread(&log, sizeof(TrafficLog), 1, fp) == 1) {
        if (cache_add(cache, &log) != 0) break;
        loaded++;
    }

    fclose(fp);
    return loaded;
}

void cache_clear(LogCache *cache) {
    if (cache) cache->count = 0;
}
