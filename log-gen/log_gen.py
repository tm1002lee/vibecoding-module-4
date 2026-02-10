#!/usr/bin/env python3
"""
log-gen: 트래픽 로그 생성 및 Backend API 전송 툴

무작위 트래픽 세션 로그를 생성하여 Backend API에 전송합니다.
logcollector C 데몬을 대체하여 테스트용으로 사용할 수 있습니다.
"""

import random
import time
import argparse
import requests
from datetime import datetime
from typing import Dict, List

# 설정
API_BASE_URL = "http://localhost:8000/api"
PROTOCOLS = ["TCP", "UDP", "ICMP"]


def generate_random_ip() -> str:
    """랜덤 IPv4 주소 생성"""
    return f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}"


def generate_random_port() -> int:
    """랜덤 포트 번호 생성 (1024-65535)"""
    return random.randint(1024, 65535)


def generate_traffic_log() -> Dict:
    """무작위 트래픽 로그 생성"""
    protocol = random.choice(PROTOCOLS)
    packets = random.randint(1, 1000)
    bytes_per_packet = random.randint(64, 1500)

    log = {
        "protocol": protocol,
        "src_ip": generate_random_ip(),
        "src_port": generate_random_port(),
        "dst_ip": generate_random_ip(),
        "dst_port": generate_random_port(),
        "packets": packets,
        "bytes": packets * bytes_per_packet,
        "cpu_id": random.randint(0, 7)
    }

    return log


def send_log_to_api(log: Dict) -> bool:
    """Backend API로 로그 전송"""
    try:
        response = requests.post(f"{API_BASE_URL}/logs", json=log, timeout=5)
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] API 전송 실패: {e}")
        return False


def print_log(log: Dict, index: int = None):
    """생성된 로그 정보 출력"""
    prefix = f"[{index}]" if index is not None else ""
    print(f"{prefix} {log['protocol']:5} | {log['src_ip']:15}:{log['src_port']:5} → "
          f"{log['dst_ip']:15}:{log['dst_port']:5} | "
          f"Packets: {log['packets']:4} | Bytes: {log['bytes']:8} | CPU: {log['cpu_id']}")


def generate_and_send_batch(count: int, verbose: bool = True) -> int:
    """배치로 로그 생성 및 전송"""
    success_count = 0

    for i in range(count):
        log = generate_traffic_log()

        if verbose:
            print_log(log, i + 1)

        if send_log_to_api(log):
            success_count += 1

        # API 부하 방지를 위한 짧은 딜레이
        time.sleep(0.01)

    return success_count


def daemon_mode(batch_size: int, interval: float):
    """데몬 모드: 주기적으로 로그 생성 및 전송"""
    print(f"[DAEMON] Starting (batch size: {batch_size}, interval: {interval}s)")
    print(f"[API] Backend: {API_BASE_URL}")
    print("종료하려면 Ctrl+C를 누르세요.\n")

    total_generated = 0
    total_sent = 0

    try:
        while True:
            start_time = time.time()

            print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 배치 생성 중...")
            sent = generate_and_send_batch(batch_size, verbose=False)

            total_generated += batch_size
            total_sent += sent

            elapsed = time.time() - start_time
            print(f"[OK] {sent}/{batch_size} sent ({elapsed:.2f}s) | "
                  f"Total: {total_sent}/{total_generated}")

            time.sleep(interval)

    except KeyboardInterrupt:
        print(f"\n\n[STOP] Generated: {total_generated}, Sent: {total_sent}")


def main():
    global API_BASE_URL

    parser = argparse.ArgumentParser(
        description="트래픽 로그 생성 및 Backend API 전송 툴"
    )

    parser.add_argument(
        "-n", "--count",
        type=int,
        default=10,
        help="생성할 로그 개수 (기본: 10)"
    )

    parser.add_argument(
        "-d", "--daemon",
        action="store_true",
        help="데몬 모드 (주기적 생성)"
    )

    parser.add_argument(
        "-i", "--interval",
        type=float,
        default=1.0,
        help="데몬 모드 배치 간격 (초, 기본: 1.0)"
    )

    parser.add_argument(
        "-q", "--quiet",
        action="store_true",
        help="상세 출력 비활성화"
    )

    parser.add_argument(
        "--api-url",
        type=str,
        default=API_BASE_URL,
        help=f"Backend API URL (기본: {API_BASE_URL})"
    )

    args = parser.parse_args()

    # API URL 설정
    API_BASE_URL = args.api_url

    print("=" * 80)
    print("log-gen: Traffic Log Generator")
    print("=" * 80)

    if args.daemon:
        daemon_mode(args.count, args.interval)
    else:
        print(f"[INFO] Generating {args.count} logs...\n")

        sent = generate_and_send_batch(args.count, verbose=not args.quiet)

        print(f"\n[DONE] {sent}/{args.count} logs sent successfully")


if __name__ == "__main__":
    main()
