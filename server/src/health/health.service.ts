import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as os from 'os';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async getSystemHealth() {
    let dbStatus = 'disconnected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (error) {
      console.error('Database Health Check Failed:', error);
      dbStatus = 'error';
    }

    // Memory Info
    const totalMemory = os.totalmem() / 1024 / 1024;
    const freeMemory = os.freemem() / 1024 / 1024;

    const usedSystemMemory = totalMemory - freeMemory;

    const memoryPercent = Math.floor((usedSystemMemory / totalMemory) * 100);

    const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024;

    // Uptime & CPU
    const uptime = process.uptime();
    const loadAvg = os.loadavg();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
      },
      system: {
        uptime: uptime,
        os: `${os.type()} ${os.release()} (${os.arch()})`,
        memory: {
          used: Math.round(usedSystemMemory),
          free: Math.round(freeMemory),
          total: Math.round(totalMemory),
          percent: memoryPercent,
          heap: Math.round(heapUsed),
        },
        cpu: {
          load: loadAvg[0],
          cores: os.cpus().length,
        },
      },
    };
  }
}
