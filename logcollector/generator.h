#ifndef GENERATOR_H
#define GENERATOR_H

#include "cache.h"

// Function prototypes
void generator_init(void);
void generator_create_random_log(TrafficLog *log);
void generator_create_batch(TrafficLog *logs, int count);

#endif // GENERATOR_H
