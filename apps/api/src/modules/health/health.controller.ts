import { Controller, Get, Header, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get('live')
  @Header('Cache-Control', 'no-store')
  getLiveness() {
    return { status: 'ok', service: 'servzit-api' };
  }

  @Get('ready')
  @Header('Cache-Control', 'no-store')
  async getReadiness() {
    try {
      await this.database.checkConnection();
      return { status: 'ready', dependencies: { database: 'connected' } };
    } catch {
      throw new ServiceUnavailableException({ status: 'not_ready', dependencies: { database: 'unavailable' } });
    }
  }
}
