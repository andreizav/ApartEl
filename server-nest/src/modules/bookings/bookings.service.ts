import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StoreService } from '../../shared/store.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
    constructor(
        private storeService: StoreService,
        private eventEmitter: EventEmitter2,
    ) { }

    findAll(tenantId: string) {
        const data = this.storeService.getTenantData(tenantId);
        return data.bookings;
    }

    create(tenantId: string, createBookingDto: CreateBookingDto) {
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

        const data = this.storeService.getTenantData(tenantId);

        // Check overlaps
        const overlaps = data.bookings.some((b: any) => {
            if (b.unitId !== unitId || b.status === 'cancelled') return false;
            const bStart = new Date(b.startDate);
            const bEnd = new Date(b.endDate);
            // Overlap logic: (StartA < EndB) and (EndA > StartB)
            return start < bEnd && end > bStart;
        });

        if (overlaps) {
            throw new BadRequestException('Selected dates are unavailable for this unit.');
        }

        const booking = {
            id: createBookingDto.id || `b-${Date.now()}`,
            unitId,
            guestName: createBookingDto.guestName || '',
            guestPhone: createBookingDto.guestPhone || '',
            startDate: startDate,
            endDate: endDate,
            source: createBookingDto.source || 'direct',
            status: createBookingDto.status || 'confirmed',
            price: createBookingDto.price,
            createdAt: createBookingDto.createdAt || new Date().toISOString(),
            assignedCleanerId: createBookingDto.assignedCleanerId,
        };

        data.bookings.push(booking);
        this.storeService.save();

        this.eventEmitter.emit('booking.created', { booking, tenantId });

        return { success: true, booking };
    }
}
