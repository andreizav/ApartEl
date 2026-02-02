import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { StoreService } from '../../shared/store.service';
import { TelegramService } from '../../shared/telegram.service';

@Injectable()
export class SettingsService {
    constructor(
        private storeService: StoreService,
        private telegramService: TelegramService
    ) { }

    getSettings(tenantId: string) {
        const data = this.storeService.getTenantData(tenantId);
        return data.appSettings;
    }

    updateSettings(tenantId: string, settings: any) {
        if (typeof settings !== 'object') throw new BadRequestException('appSettings must be an object');
        const data = this.storeService.getTenantData(tenantId);
        data.appSettings = { ...data.appSettings, ...settings };
        this.storeService.save();
        return data.appSettings;
    }

    async testTelegram(token: string, chatId: string) {
        if (!token || !chatId) {
            throw new BadRequestException('Missing token or chat ID');
        }

        try {
            const text = '🔔 *ApartEl Test Notification*\n\nYour bot is successfully connected! You will receive system alerts here.';
            const result = await this.telegramService.sendMessage(token, chatId, text);
            return { success: true, result };
        } catch (error: any) {
            if (error.message.includes('Telegram Unreachable')) {
                throw new ServiceUnavailableException('Network Error: Cannot reach Telegram servers.');
            }
            throw error;
        }
    }

    async syncTelegram(tenantId: string) {
        const data = this.storeService.getTenantData(tenantId);
        const token = data.appSettings.tgBotToken;

        if (!token) {
            throw new BadRequestException('Bot token not configured.');
        }

        try {
            const result = await this.telegramService.syncUpdates(token, tenantId);
            return { success: true, ...result };
        } catch (err: any) {
            throw new BadRequestException(err.message);
        }
    }
}
