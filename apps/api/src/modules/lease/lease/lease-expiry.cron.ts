import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { LeaseService } from './lease.service';

@Injectable()
export class LeaseExpiryCron {
  private readonly logger = new Logger(LeaseExpiryCron.name);

  constructor(private readonly leaseService: LeaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiry(): Promise<void> {
    const count = await this.leaseService.expireDueLeases();
    if (count > 0) this.logger.log(`Automatically expired ${count} lease(s) past their end date`);
  }
}
