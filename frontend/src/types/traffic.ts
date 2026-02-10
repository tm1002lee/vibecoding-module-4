export interface TrafficLog {
  id: number;
  protocol: string;
  src_ip: string;
  src_port: number;
  dst_ip: string;
  dst_port: number;
  packets: number;
  bytes: number;
  timestamp: string;
  cpu_id: number;
}
