import { CountsService } from './counts.service';

function mockDb(counts: { total: number; occupied: number; totalBuildings?: number }) {
  return {
    unit: {
      count: jest
        .fn()
        .mockImplementationOnce(() => Promise.resolve(counts.total))
        .mockImplementationOnce(() => Promise.resolve(counts.occupied))
        .mockImplementation(() => Promise.resolve(counts.total)),
    },
    building: {
      update: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(counts.totalBuildings ?? 0),
    },
    property: {
      update: jest.fn().mockResolvedValue({}),
    },
  } as unknown as Parameters<CountsService['syncBuilding']>[0];
}

describe('CountsService', () => {
  it('syncBuilding recomputes totalUnits/occupiedUnits/vacantUnits from live units', async () => {
    const service = new CountsService();
    const db = mockDb({ total: 10, occupied: 4 });
    await service.syncBuilding(db, 'bld1');
    expect((db as any).building.update).toHaveBeenCalledWith({
      where: { id: 'bld1' },
      data: { totalUnits: 10, occupiedUnits: 4, vacantUnits: 6 },
    });
  });

  it('syncBuilding floors vacantUnits at 0 rather than going negative', async () => {
    const service = new CountsService();
    // total=2, occupied=5 (defensive edge case: stale/overlapping data)
    const db = mockDb({ total: 2, occupied: 5 });
    await service.syncBuilding(db, 'bld1');
    expect((db as any).building.update).toHaveBeenCalledWith({
      where: { id: 'bld1' },
      data: { totalUnits: 2, occupiedUnits: 5, vacantUnits: 0 },
    });
  });

  it('syncProperty recomputes building + unit rollups for a property', async () => {
    const service = new CountsService();
    const db = {
      building: { count: jest.fn().mockResolvedValue(3), update: jest.fn() },
      unit: {
        count: jest
          .fn()
          .mockImplementationOnce(() => Promise.resolve(20))
          .mockImplementationOnce(() => Promise.resolve(15)),
      },
      property: { update: jest.fn().mockResolvedValue({}) },
    } as unknown as Parameters<CountsService['syncProperty']>[0];

    await service.syncProperty(db, 'prop1');

    expect((db as any).property.update).toHaveBeenCalledWith({
      where: { id: 'prop1' },
      data: { totalBuildings: 3, totalUnits: 20, occupiedUnits: 15, vacantUnits: 5 },
    });
  });

  describe('syncForUnit', () => {
    it('syncs both building and property when a buildingId is present', async () => {
      const service = new CountsService();
      const syncBuilding = jest.spyOn(service, 'syncBuilding').mockResolvedValue();
      const syncProperty = jest.spyOn(service, 'syncProperty').mockResolvedValue();
      const db = {} as unknown as Parameters<CountsService['syncForUnit']>[0];

      await service.syncForUnit(db, 'prop1', 'bld1');

      expect(syncBuilding).toHaveBeenCalledWith(db, 'bld1');
      expect(syncProperty).toHaveBeenCalledWith(db, 'prop1');
    });

    it('skips building sync when buildingId is null (unit not assigned to a building)', async () => {
      const service = new CountsService();
      const syncBuilding = jest.spyOn(service, 'syncBuilding').mockResolvedValue();
      const syncProperty = jest.spyOn(service, 'syncProperty').mockResolvedValue();
      const db = {} as unknown as Parameters<CountsService['syncForUnit']>[0];

      await service.syncForUnit(db, 'prop1', null);

      expect(syncBuilding).not.toHaveBeenCalled();
      expect(syncProperty).toHaveBeenCalledWith(db, 'prop1');
    });
  });
});
