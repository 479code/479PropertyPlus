import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { type Membership } from '@prisma/client';

import { MembershipRepository } from './membership.repository';

@Injectable()
export class MembershipService {
  constructor(private readonly repository: MembershipRepository) {}

  listForUser(userId: string): Promise<Membership[]> {
    return this.repository.findActiveForUser(userId);
  }

  find(userId: string, organizationId: string): Promise<Membership | null> {
    return this.repository.findByUserAndOrg(userId, organizationId);
  }

  /**
   * Resolve the membership a user holds in an organization, enforcing that it
   * exists and is active. Used when switching organizations and accepting
   * org-scoped tokens.
   */
  async getActiveOrThrow(userId: string, organizationId: string): Promise<Membership> {
    const membership = await this.repository.findByUserAndOrg(userId, organizationId);
    if (!membership) {
      throw new NotFoundException('You are not a member of that organization');
    }
    if (membership.status !== 'ACTIVE') {
      throw new ForbiddenException(`Membership is ${membership.status.toLowerCase()}`);
    }
    return membership;
  }
}
