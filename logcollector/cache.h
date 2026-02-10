#ifndef CACHE_H
#define CACHE_H

#include <time.h>

// Traffic log structure
typedef struct {
    char protocol[16];
    char src_ip[46];       // IPv6 support
    int src_port;
    char dst_ip[46];
    int dst_port;
    int packets;
    long bytes;
    time_t timestamp;
    int cpu_id;
} TrafficLog;

// Cache management
typedef struct {
    TrafficLog *logs;
    int count;
    int capacity;
} LogCache;

// Function prototypes
LogCache* cache_create(int capacity);
void cache_destroy(LogCache *cache);
int cache_add(LogCache *cache, TrafficLog *log);
int cache_flush_to_file(LogCache *cache, const char *filepath);
int cache_load_from_file(LogCache *cache, const char *filepath);
void cache_clear(LogCache *cache);

#endif // CACHE_H
