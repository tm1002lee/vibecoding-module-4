CC = gcc
CFLAGS = -Wall -Wextra -O2 -std=c99
LDFLAGS = -lsqlite3
TARGET = logcollector
OBJS = main.o cache.o db.o generator.o

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $<

clean:
	rm -f $(OBJS) $(TARGET) *.db *.dat *.pid *.log

run: $(TARGET)
	./$(TARGET)

.PHONY: all clean run
