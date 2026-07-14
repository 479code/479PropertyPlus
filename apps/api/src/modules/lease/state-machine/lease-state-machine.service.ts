import { BadRequestException, Injectable } from '@nestjs/common';
import { type LeaseStatus } from '@prisma/client';

import { LeaseConfigRepository } from '../config/lease-config.repository';

@Injectable()
export class LeaseStateMachineService {
  constructor(private readonly configRepository: LeaseConfigRepository) {}

  /**
   * Throws if the transition isn't a row in LeaseStateTransition for this org.
   * The graph is data, not code — see default-lease-config.ts for the seeded
   * edges and lease-config.service.ts for how they're materialized per org.
   */
  async assertCanTransition(
    organizationId: string,
    fromStatusId: string,
    toStatusId: string,
  ): Promise<void> {
    if (fromStatusId === toStatusId) return;
    const allowed = await this.configRepository.findAllowedTransition(
      organizationId,
      fromStatusId,
      toStatusId,
    );
    if (!allowed) {
      const [from, to] = await Promise.all([
        this.configRepository.findLeaseStatusById(organizationId, fromStatusId),
        this.configRepository.findLeaseStatusById(organizationId, toStatusId),
      ]);
      throw new BadRequestException(
        `Cannot transition a lease from "${from?.name ?? fromStatusId}" to "${to?.name ?? toStatusId}"`,
      );
    }
  }

  async getAllowedNextStatuses(
    organizationId: string,
    fromStatusId: string,
  ): Promise<LeaseStatus[]> {
    const transitions = await this.configRepository.listTransitionsFrom(
      organizationId,
      fromStatusId,
    );
    return transitions.map((t) => t.toStatus);
  }
}
