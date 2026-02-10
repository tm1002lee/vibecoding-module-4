# LogCollector C Daemon

방화벽 트래픽 로그를 수집하고 SQLite 데이터베이스에 저장하는 C 기반 데몬입니다.

## 기능

- ✅ **메모리 캐시**: 로그를 메모리에 캐싱하여 성능 최적화
- ✅ **임계치 관리**: 캐시가 임계치를 초과하면 자동으로 DB에 flush
- ✅ **임시 파일**: DB 삽입 실패 시 임시 파일로 저장
- ✅ **SQLite 저장**: 트래픽 로그를 SQLite DB에 bulk insert
- ✅ **Rolling DB**: DB 파일 크기가 임계치를 초과하면 새 파일 생성
- ✅ **랜덤 생성**: 테스트용 랜덤 트래픽 로그 생성 (TCP/UDP/ICMP)
- ✅ **데몬 모드**: 백그라운드에서 지속적으로 로그 생성 및 저장

## 빌드

```bash
cd logcollector
make
```

## 실행

```bash
./logcollector
```

종료는 `Ctrl+C` 또는 `kill` 명령으로 가능합니다.

## 설정

`config.h` 파일에서 다음 설정을 변경할 수 있습니다:

- `CACHE_SIZE_THRESHOLD`: 캐시 flush 임계치 (기본: 10000)
- `DB_MAX_SIZE_MB`: DB rolling 임계치 (기본: 100MB)
- `GEN_INTERVAL_MS`: 로그 생성 간격 (기본: 100ms)
- `GEN_BATCH_SIZE`: 배치당 로그 생성 개수 (기본: 10)

## 파일 구조

```
logcollector/
├── main.c           # 메인 데몬 로직
├── cache.c/h        # 메모리 캐시 관리
├── db.c/h           # SQLite 연결 및 저장
├── generator.c/h    # 랜덤 트래픽 데이터 생성
├── config.h         # 설정 상수
├── Makefile         # 빌드 스크립트
└── README.md        # 이 파일
```

## 생성되는 파일

- `logs.db`: 메인 SQLite 데이터베이스
- `logs_<timestamp>.db`: Rolling된 DB 파일들
- `cache_temp.dat`: 임시 캐시 파일 (DB 실패 시)

## 데이터베이스 스키마

```sql
CREATE TABLE traffic_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    protocol TEXT NOT NULL,
    src_ip TEXT NOT NULL,
    src_port INTEGER NOT NULL,
    dst_ip TEXT NOT NULL,
    dst_port INTEGER NOT NULL,
    packets INTEGER NOT NULL,
    bytes INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    cpu_id INTEGER DEFAULT 0
);
```

## 성능

- 기본 설정(100ms 간격, 배치 10개)으로 초당 약 100개의 로그 생성
- 캐시 임계치(10000개)에 도달하면 bulk insert로 DB에 저장
- SQLite 트랜잭션을 사용하여 성능 최적화

## 주의사항

- SQLite3 라이브러리가 설치되어 있어야 합니다
- Windows에서는 MinGW 또는 Cygwin 환경에서 빌드 필요
- 프로덕션 환경에서는 커널 모듈과 연동하여 실제 트래픽을 수집해야 합니다
