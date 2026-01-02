export interface SystemHealth {
  status: string;
  timestamp: string;
  database: {
    status: string;
  };
  system: {
    uptime: number;
    os: string;
    memory: {
      used: number;
      free: number;
      total: number;
      percent: number;
      heap: number;
    };
    cpu: {
      load: number;
      cores: number;
    };
  };
}
