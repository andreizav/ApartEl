
import { Component, signal, inject, computed, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService, Staff, ChatMessage, Booking } from '../shared/portfolio.service';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff.component.html',
})
export class StaffComponent implements AfterViewChecked {
  private portfolioService = inject(PortfolioService);
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // Shared Data
  staffList = this.portfolioService.staff;
  bookings = this.portfolioService.bookings;
  portfolio = this.portfolioService.portfolio;

  // Local State
  searchQuery = signal('');
  selectedStaffId = signal<string | null>(null);
  
  // Modals
  isModalOpen = signal(false); // Add/Edit Staff Modal
  isEditing = signal(false);
  currentMember = signal<Partial<Staff>>({});
  
  isAssignModalOpen = signal(false); // Assign Task Modal

  roles = ['Manager', 'Cleaner', 'Maintenance', 'Receptionist'];

  // --- Computed ---

  filteredStaff = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.staffList().filter(s => 
      s.name.toLowerCase().includes(query) || 
      s.email.toLowerCase().includes(query) ||
      s.role.toLowerCase().includes(query)
    );
  });

  selectedStaff = computed(() => {
    return this.staffList().find(s => s.id === this.selectedStaffId()) || null;
  });

  // Bookings that are Active or Future and NOT assigned to anyone
  linkableBookings = computed(() => {
    const now = new Date();
    // Filter logic: Booking end date must be >= today (active/future) AND no cleaner assigned
    return this.bookings()
      .filter(b => {
         const end = new Date(b.endDate);
         return end >= now && !b.assignedCleanerId && b.source !== 'blocked';
      })
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  });

  // --- Lifecycle ---

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  // --- Actions ---

  selectStaff(id: string) {
    this.selectedStaffId.set(id);
  }

  openAddModal() {
    this.isEditing.set(false);
    this.currentMember.set({
      role: 'Cleaner',
      status: 'Active',
      avatar: `https://picsum.photos/seed/${Date.now()}/100/100`,
      messages: [],
      unreadCount: 0,
      online: false,
      lastActive: new Date()
    });
    this.isModalOpen.set(true);
  }

  openEditModal(member: Staff) {
    this.isEditing.set(true);
    this.currentMember.set({ ...member });
    this.isModalOpen.set(true);
  }

  saveMember() {
    const data = this.currentMember();
    if (!data.name || !data.email) return;

    if (this.isEditing() && data.id) {
        this.portfolioService.updateStaff(data as Staff);
    } else {
        const newMember: Staff = {
            id: `s-${Date.now()}`,
            name: data.name,
            role: data.role || 'Cleaner',
            email: data.email,
            phone: data.phone || '',
            avatar: data.avatar || `https://picsum.photos/seed/${Date.now()}/100/100`,
            status: data.status || 'Active',
            messages: [],
            unreadCount: 0,
            online: false,
            lastActive: new Date()
        };
        this.portfolioService.addStaff(newMember);
        if (!this.selectedStaffId()) {
            this.selectedStaffId.set(newMember.id);
        }
    }
    this.isModalOpen.set(false);
  }

  deleteMember(id: string) {
    if (confirm('Are you sure you want to delete this staff member?')) {
        this.portfolioService.deleteStaff(id);
        if (this.selectedStaffId() === id) {
            this.selectedStaffId.set(null);
        }
    }
  }

  // --- Assignment Logic ---

  openAssignModal() {
    this.isAssignModalOpen.set(true);
  }

  assignBooking(booking: Booking) {
    const staff = this.selectedStaff();
    if (!staff) return;

    // 1. Update Booking
    this.bookings.update(list => list.map(b => {
        if (b.id === booking.id) {
            return { ...b, assignedCleanerId: staff.id };
        }
        return b;
    }));

    // 2. Add System Message to Staff Chat
    const unitName = this.getUnitName(booking.unitId);
    const assignMsg: ChatMessage = {
        id: `sys-assign-${Date.now()}`,
        text: `New Task Assigned: Cleaning for ${unitName}\nCheck-out: ${new Date(booking.endDate).toLocaleDateString()}`,
        sender: 'bot',
        timestamp: new Date(),
        status: 'read'
    };

    this.staffList.update(list => list.map(s => {
        if (s.id === staff.id) {
            return {
                ...s,
                messages: [...s.messages, assignMsg],
                unreadCount: s.unreadCount + 1,
                lastActive: new Date()
            };
        }
        return s;
    }));

    this.isAssignModalOpen.set(false);
  }

  // --- Helpers ---

  getUnitName(unitId: string): string {
    for (const group of this.portfolio()) {
       const unit = group.units.find((u: any) => u.id === unitId);
       if (unit) return unit.name;
    }
    return 'Unknown Unit';
  }

  formatTime(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  getLastMessage(staff: Staff): string {
    if (staff.messages.length === 0) return 'No activity';
    const last = staff.messages[staff.messages.length - 1];
    return last.text;
  }
}
