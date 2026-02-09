/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../../shared/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: any;
  let eventEmitter: EventEmitter2;

  const mockPrismaService = {
    booking: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const tenantId = 'tenant-1';
    const createDto: CreateBookingDto = {
      unitId: 'unit-1',
      guestName: 'John Doe',
      startDate: new Date('2024-01-10').toISOString(),
      endDate: new Date('2024-01-15').toISOString(),
      price: 100,
    };

    it('should create a booking if no overlap', async () => {
      // Mock findFirst to return null (no overlap)
      prisma.booking.findFirst.mockResolvedValue(null);

      const createdBooking = {
        id: 'b-1',
        tenantId,
        unitId: createDto.unitId,
        guestName: createDto.guestName,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        price: createDto.price,
        source: 'direct',
        status: 'confirmed',
      };

      prisma.booking.create.mockResolvedValue(createdBooking);

      const result = await service.create(tenantId, createDto);

      expect(prisma.booking.findFirst).toHaveBeenCalledWith({
        where: {
          unitId: createDto.unitId,
          status: { not: 'cancelled' },
          AND: [
            { startDate: { lt: expect.any(Date) } },
            { endDate: { gt: expect.any(Date) } },
          ],
        },
      });

      expect(prisma.booking.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'booking.created',
        expect.objectContaining({ booking: createdBooking, tenantId }),
      );
      expect(result).toEqual({ success: true, booking: createdBooking });
    });

    it('should throw BadRequestException if overlapping booking exists', async () => {
      // Mock findFirst to return an existing booking (overlap)
      prisma.booking.findFirst.mockResolvedValue({ id: 'b-existing' });

      await expect(service.create(tenantId, createDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(prisma.booking.findFirst).toHaveBeenCalled();
      expect(prisma.booking.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if start date >= end date', async () => {
      const invalidDto: CreateBookingDto = {
        ...createDto,
        startDate: '2024-01-15T10:00:00.000Z',
        endDate: '2024-01-15T10:00:00.000Z', // Same as start
      };

      await expect(service.create(tenantId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
