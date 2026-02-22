/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../shared/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateBookingDto } from './dto/create-booking.dto';

describe('BookingsService', () => {
  let service: BookingsService;
  let prismaService: PrismaService;

  const prismaMock = {
    booking: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findFirst with correct overlap criteria', async () => {
    const tenantId = 't1';
    const createDto: CreateBookingDto = {
      unitId: 'u1',
      startDate: '2023-01-01T00:00:00.000Z',
      endDate: '2023-01-05T00:00:00.000Z',
      guestName: 'John',
      price: 100,
    };

    // Mock no overlap
    (prismaMock.booking.findFirst as jest.Mock).mockResolvedValue(null);
    (prismaMock.booking.create as jest.Mock).mockResolvedValue({
      id: 'b1',
      ...createDto,
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
    });

    await service.create(tenantId, createDto);

    expect(prismaMock.booking.findFirst).toHaveBeenCalledWith({
      where: {
        unitId: 'u1',
        status: { not: 'cancelled' },
        AND: [
          { startDate: { lt: expect.any(Date) } },
          { endDate: { gt: expect.any(Date) } },
        ],
      },
    });
  });
});
