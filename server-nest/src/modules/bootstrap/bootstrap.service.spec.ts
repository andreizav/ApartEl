/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { BootstrapService } from './bootstrap.service';
import { PrismaService } from '../../shared/prisma.service';

describe('BootstrapService', () => {
  let service: BootstrapService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      portfolioGroup: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'pg1',
            units: [
              { id: 'u1', photos: '[]' },
              { id: 'u2', photos: '[]' },
            ],
          },
        ]),
      },
      booking: { findMany: jest.fn().mockResolvedValue([]) },
      client: { findMany: jest.fn().mockResolvedValue([]) },
      staff: { findMany: jest.fn().mockResolvedValue([]) },
      transaction: { findMany: jest.fn().mockResolvedValue([]) },
      inventoryCategory: { findMany: jest.fn().mockResolvedValue([]) },
      tenant: { findUnique: jest.fn().mockResolvedValue({}) },
      channelMapping: { findMany: jest.fn().mockResolvedValue([]) },
      icalConnection: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BootstrapService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<BootstrapService>(BootstrapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should optimize N+1 queries by fetching mappings and icals in batch', async () => {
    await service.getBootstrapData('tenant-1', {}, {});

    // Expect findMany to be called with "in: [ids]" instead of N times
    expect(prismaMock.channelMapping.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.channelMapping.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { unitId: { in: expect.arrayContaining(['u1', 'u2']) } },
      }),
    );

    expect(prismaMock.icalConnection.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.icalConnection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { unitId: { in: expect.arrayContaining(['u1', 'u2']) } },
      }),
    );
  });
});
