export class CreateBookingDto {
    id?: string;
    unitId!: string;
    startDate!: string;
    endDate!: string;
    guestName?: string;
    guestPhone?: string;
    source?: string;
    status?: string;
    price?: number;
    createdAt?: string;
    assignedCleanerId?: string;
}
