import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  @Get('info')
  getInfo() {
    return {
      app: 'Demo Domain Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      message: 'Hello from NestJS on Kubernetes! 🎉',
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
