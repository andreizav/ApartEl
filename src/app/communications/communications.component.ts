import { Component, signal, computed, ViewChild, ElementRef, AfterViewChecked, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService, ChatMessage, Client, Staff } from '../shared/portfolio.service';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'app-communications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './communications.component.html',
})
export class CommunicationsComponent implements AfterViewChecked {
  private portfolioService = inject(PortfolioService);
  private apiService = inject(ApiService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  // --- State ---
  chatMode = signal<'clients' | 'staff'>('clients');
  activePlatform = signal<'whatsapp' | 'telegram'>('whatsapp');

  // Active Conversation ID
  activeId = signal<string | null>('c1'); // Phone for clients, ID for staff

  userInput = signal('');
  isTyping = signal(false);

  // Simulation Modal State
  isSimulateModalOpen = signal(false);
  simPhone = signal('');
  simName = signal('');
  simPlatform = signal<'whatsapp' | 'telegram'>('whatsapp');
  simMessage = signal('');

  // --- Computed Lists ---

  currentList = computed(() => {
    if (this.chatMode() === 'clients') {
      const platform = this.activePlatform();
      return this.portfolioService.clients()
        .filter(c => c.platform === platform)
        .map(c => ({
          id: c.phoneNumber,
          name: c.name,
          avatar: c.avatar,
          unread: c.unreadCount,
          online: c.online,
          lastTime: this.formatTime(c.lastActive),
          lastMessage: this.getLastMsgPreview(c.messages)
        }));
    } else {
      // Staff mode
      return this.portfolioService.staff()
        .map(s => ({
          id: s.id,
          name: s.name,
          avatar: s.avatar,
          unread: s.unreadCount,
          online: s.online,
          lastTime: this.formatTime(s.lastActive),
          lastMessage: this.getLastMsgPreview(s.messages)
        }));
    }
  });

  activeMessages = computed(() => {
    const id = this.activeId();
    if (!id) return [];

    if (this.chatMode() === 'clients') {
      const client = this.portfolioService.clients().find(c => c.phoneNumber === id);
      return client ? client.messages : [];
    } else {
      const member = this.portfolioService.staff().find(s => s.id === id);
      return member ? member.messages : [];
    }
  });

  activeContact = computed(() => {
    const id = this.activeId();
    if (!id) return null;

    if (this.chatMode() === 'clients') {
      const c = this.portfolioService.clients().find(client => client.phoneNumber === id);
      return c ? { name: c.name, avatar: c.avatar, online: c.online } : null;
    } else {
      const s = this.portfolioService.staff().find(staff => staff.id === id);
      return s ? { name: s.name, avatar: s.avatar, online: s.online } : null;
    }
  });

  constructor() {
    // Select first item when mode changes
    effect(() => {
      const mode = this.chatMode();
      const platform = this.activePlatform();

      // Prevent infinite loop by untracking or just checking current val if needed, 
      // but simpler to just pick first if current selection is invalid for new mode
      const currentId = this.activeId();

      if (mode === 'clients') {
        const exists = this.portfolioService.clients().some(c => c.phoneNumber === currentId && c.platform === platform);
        if (!exists) {
          const first = this.portfolioService.clients().find(c => c.platform === platform);
          this.activeId.set(first ? first.phoneNumber : null);
        }
      } else {
        const exists = this.portfolioService.staff().some(s => s.id === currentId);
        if (!exists) {
          const first = this.portfolioService.staff()[0];
          this.activeId.set(first ? first.id : null);
        }
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  // --- Actions ---

  setPlatform(p: 'whatsapp' | 'telegram') {
    this.activePlatform.set(p);
  }

  setChatMode(mode: 'clients' | 'staff') {
    this.chatMode.set(mode);
  }

  selectContact(id: string) {
    this.activeId.set(id);

    // Clear unread in service
    if (this.chatMode() === 'clients') {
      this.portfolioService.clients.update(list =>
        list.map(c => c.phoneNumber === id ? { ...c, unreadCount: 0 } : c)
      );
    } else {
      this.portfolioService.staff.update(list =>
        list.map(s => s.id === id ? { ...s, unreadCount: 0 } : s)
      );
    }
  }

  sendMessage() {
    const text = this.userInput().trim();
    const id = this.activeId();

    if (!text || !id) return;

    // Simulate Bot Message (Requirement: my message simulates bot)
    const botMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      text: text,
      sender: 'bot', // Sending as bot/agent
      timestamp: new Date(),
      status: 'sent',
      platform: this.activePlatform() // Only relevant for clients really
    };

    this.addMessageToState(id, botMsg);
    this.userInput.set('');

    // Save message to database for clients
    if (this.chatMode() === 'clients') {
      this.apiService.saveLocalMessage(id, text, 'bot', this.activePlatform()).subscribe();
    }

    // Simulate Status Updates
    setTimeout(() => this.updateMessageStatus(id, botMsg.id, 'delivered'), 1000);
    setTimeout(() => this.updateMessageStatus(id, botMsg.id, 'read'), 2500);

    // Simulate Reply from Client/Staff
    this.simulateReply(id);
  }

  // --- Simulation Logic ---

  simulateReply(contactId: string) {
    // Random delay before typing starts
    setTimeout(() => {
      if (this.activeId() === contactId) {
        this.isTyping.set(true);
      }

      // Typing duration
      setTimeout(() => {
        this.isTyping.set(false);

        const replies = [
          "That sounds perfect, thank you!",
          "Could you send me the invoice?",
          "I'll let you know in a bit.",
          "Okay, great.",
          "What is the wifi password again?",
          "Thanks for your help.",
          "Is there parking nearby?"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const senderType = this.chatMode() === 'clients' ? 'client' : 'staff';

        const replyMsg: ChatMessage = {
          id: `m-reply-${Date.now()}`,
          text: randomReply,
          sender: senderType,
          timestamp: new Date(),
          status: 'read' // Incoming messages are effectively 'read' status from their perspective immediately? Or just normal.
        };

        this.addMessageToState(contactId, replyMsg);

        // Save simulated reply to database for clients
        if (this.chatMode() === 'clients') {
          this.apiService.saveLocalMessage(contactId, randomReply, 'client', this.activePlatform()).subscribe();
        }

      }, 2000 + Math.random() * 2000); // 2-4 seconds typing

    }, 1000);
  }

  openSimulateModal() {
    this.simPlatform.set(this.activePlatform());
    this.simPhone.set('');
    this.simName.set('');
    this.simMessage.set('Hello! I saw your listing.');
    this.isSimulateModalOpen.set(true);
  }

  submitSimulation() {
    const phone = this.simPhone().trim();
    const text = this.simMessage().trim();
    const platform = this.simPlatform();

    if (!phone || !text) return;

    // Check if client exists
    const existing = this.portfolioService.clients().find(c => c.phoneNumber === phone);

    const newMessage: ChatMessage = {
      id: `m-new-${Date.now()}`,
      text: text,
      sender: 'client',
      timestamp: new Date(),
      status: 'read',
      platform: platform
    };

    if (existing) {
      this.addMessageToState(existing.phoneNumber, newMessage);
      // Save message to database
      this.apiService.saveLocalMessage(existing.phoneNumber, text, 'client', platform).subscribe();
      // Force platform switch if needed
      if (existing.platform !== this.activePlatform()) {
        this.setPlatform(existing.platform);
      }
      this.selectContact(existing.phoneNumber);
    } else {
      // Create new client object but DO NOT save to state yet
      // Instead, pass it to notification as pending
      const newClient: Client = {
        id: `c-new-${Date.now()}`,
        phoneNumber: phone,
        name: this.simName().trim() || phone,
        avatar: `https://picsum.photos/seed/${phone}/100/100`,
        email: '', address: '', country: '', previousBookings: 0,
        status: 'New',
        unreadCount: 1,
        online: true,
        platform: platform,
        lastActive: new Date(),
        createdAt: new Date(),
        messages: [newMessage]
      };

      // Save message to database (backend will auto-create client)
      this.apiService.saveLocalMessage(phone, text, 'client', platform).subscribe();

      // Add Notification for new client request
      this.portfolioService.addNotification({
        id: `notif-${Date.now()}`,
        title: 'New Client Request',
        message: `Incoming message from ${phone}: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
        type: 'alert',
        timestamp: new Date(),
        data: { pendingClient: newClient }
      });

      // Do not force platform or select contact because they don't exist in the list yet
    }

    this.isSimulateModalOpen.set(false);
  }

  // --- Helpers to mutate shared state ---

  private addMessageToState(id: string, msg: ChatMessage) {
    if (this.chatMode() === 'clients') {
      this.portfolioService.clients.update(list =>
        list.map(c => {
          if (c.phoneNumber === id) {
            return {
              ...c,
              messages: [...(c.messages || []), msg],
              lastActive: new Date(),
              unreadCount: msg.sender === 'client' ? c.unreadCount + 1 : c.unreadCount
            };
          }
          return c;
        })
      );
    } else {
      this.portfolioService.staff.update(list =>
        list.map(s => {
          if (s.id === id) {
            return {
              ...s,
              messages: [...(s.messages || []), msg],
              lastActive: new Date(),
              unreadCount: msg.sender === 'staff' ? s.unreadCount + 1 : s.unreadCount
            };
          }
          return s;
        })
      );
    }
  }

  private updateMessageStatus(id: string, msgId: string, status: 'delivered' | 'read') {
    // Only relevant for sent messages (bot)
    if (this.chatMode() === 'clients') {
      this.portfolioService.clients.update(list =>
        list.map(c => {
          if (c.phoneNumber === id) {
            return {
              ...c,
              messages: c.messages.map(m => m.id === msgId ? { ...m, status } : m)
            };
          }
          return c;
        })
      );
    } else {
      this.portfolioService.staff.update(list =>
        list.map(s => {
          if (s.id === id) {
            return {
              ...s,
              messages: s.messages.map(m => m.id === msgId ? { ...m, status } : m)
            };
          }
          return s;
        })
      );
    }
  }

  private getLastMsgPreview(messages: ChatMessage[]): string {
    if (!messages || messages.length === 0) return '';
    return messages[messages.length - 1].text;
  }

  formatTime(date: Date): string {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
}