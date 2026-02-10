#include "generator.h"
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <stdio.h>

static const char *protocols[] = {"TCP", "UDP", "ICMP"};
static int initialized = 0;

void generator_init(void) {
    if (!initialized) {
        srand(time(NULL));
        initialized = 1;
    }
}

static void generate_random_ip(char *ip_buf, size_t buf_size) {
    snprintf(ip_buf, buf_size, "%d.%d.%d.%d",
             rand() % 256, rand() % 256, rand() % 256, rand() % 256);
}

static int generate_random_port(void) {
    return 1024 + (rand() % (65535 - 1024)); // Ports 1024-65535
}

static const char* generate_random_protocol(void) {
    return protocols[rand() % 3];
}

void generator_create_random_log(TrafficLog *log) {
    if (!log) return;

    memset(log, 0, sizeof(TrafficLog));

    // Protocol
    strncpy(log->protocol, generate_random_protocol(), sizeof(log->protocol) - 1);

    // IPs
    generate_random_ip(log->src_ip, sizeof(log->src_ip));
    generate_random_ip(log->dst_ip, sizeof(log->dst_ip));

    // Ports
    log->src_port = generate_random_port();
    log->dst_port = generate_random_port();

    // Traffic stats
    log->packets = 1 + (rand() % 1000);
    log->bytes = log->packets * (64 + (rand() % 1500)); // 64-1564 bytes per packet

    // Timestamp
    log->timestamp = time(NULL);

    // CPU ID
    log->cpu_id = rand() % 8; // Assume 0-7 CPUs
}

void generator_create_batch(TrafficLog *logs, int count) {
    if (!logs || count <= 0) return;

    for (int i = 0; i < count; i++) {
        generator_create_random_log(&logs[i]);
    }
}
