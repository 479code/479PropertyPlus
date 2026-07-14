import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

import { type AuditService } from '../../audit/audit.service';
import { type PersonRepository } from '../person/person.repository';

import { type EmergencyContactRepository } from './emergency-contact.repository';
import { EmergencyContactService } from './emergency-contact.service';

function build(existing: Array<{ contactPersonId: string }> = []) {
  const repository = {
    list: jest.fn().mockResolvedValue(existing),
    findById: jest.fn(),
    create: jest.fn().mockResolvedValue({ id: 'ec1' }),
    update: jest.fn().mockResolvedValue({ id: 'ec1' }),
    remove: jest.fn().mockResolvedValue({ id: 'ec1' }),
  } as unknown as EmergencyContactRepository;
  const people = {
    findById: jest.fn().mockResolvedValue({ id: 'person' }),
  } as unknown as PersonRepository;
  const audit = { record: jest.fn() } as unknown as AuditService;
  return { service: new EmergencyContactService(repository, people, audit), repository, people };
}

describe('EmergencyContactService', () => {
  it('rejects a person designating themselves as their own emergency contact', async () => {
    const { service } = build();
    await expect(
      service.create('org1', 'person1', { contactPersonId: 'person1', relationship: 'Self' }, 'u1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when the contact person does not exist in the organization', async () => {
    const { service, people } = build();
    (people.findById as jest.Mock)
      .mockResolvedValueOnce({ id: 'person1' })
      .mockResolvedValueOnce(null);
    await expect(
      service.create('org1', 'person1', { contactPersonId: 'ghost', relationship: 'Friend' }, 'u1'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a duplicate emergency-contact assignment for the same pair', async () => {
    const { service } = build([{ contactPersonId: 'person2' }]);
    await expect(
      service.create(
        'org1',
        'person1',
        { contactPersonId: 'person2', relationship: 'Sibling' },
        'u1',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates successfully for a valid, non-duplicate, non-self pair', async () => {
    const { service, repository } = build([]);
    const created = await service.create(
      'org1',
      'person1',
      { contactPersonId: 'person2', relationship: 'Sibling' },
      'u1',
    );
    expect(created).toEqual({ id: 'ec1' });
    expect(repository.create).toHaveBeenCalledWith('person1', {
      contactPersonId: 'person2',
      relationship: 'Sibling',
    });
  });
});
