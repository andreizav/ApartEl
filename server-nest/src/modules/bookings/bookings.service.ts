import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../shared/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2,
    ) { }

    async findAll(tenantId: string) {
        return this.prisma.booking.findMany({
            where: { tenantId }
        });
    }

    async create(tenantId: string, createBookingDto: CreateBookingDto) {
        const { startDate, endDate, unitId } = createBookingDto;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime())) {
            throw new BadRequestException('Invalid start date format.');
        }
        if (isNaN(end.getTime())) {
            throw new BadRequestException('Invalid end date format.');
        }
        if (start >= end) {
            throw new BadRequestException('End date must be after check-in date.');
        }

        // Check overlaps
        const overlapping = await this.prisma.booking.findFirst({
            where: {
                unitId,
                status: { not: 'cancelled' },
                AND: [
                    { startDate: { lt: end } },
                    { endDate: { gt: start } }
                ]
            }
        });

        if (overlapping) {
            throw new BadRequestException('Selected dates are unavailable for this unit.');
        }

        const booking = await this.prisma.booking.create({
            data: {
                id: createBookingDto.id || `b-${Date.now()}`,
                tenantId,
                unitId,
                guestName: createBookingDto.guestName || '',
                guestPhone: createBookingDto.guestPhone || '',
                startDate: start,
                endDate: end,
                source: createBookingDto.source || 'direct',
                status: createBookingDto.status || 'confirmed',
                price: createBookingDto.price ?? 0,
                createdAt: createBookingDto.createdAt ? new Date(createBookingDto.createdAt) : new Date(),
                assignedCleanerId: createBookingDto.assignedCleanerId,
            }
        });

        this.eventEmitter.emit('booking.created', { booking, tenantId });

        return { success: true, booking };
    }
}
