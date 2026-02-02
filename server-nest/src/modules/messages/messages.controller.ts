import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '../auth/auth.guard';
import { TenantId } from '../auth/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post('send')
    sendMessage(@TenantId() tenantId: string, @Body() body: any) {
        const { recipientId, text, platform } = body;
        return this.messagesService.sendMessage(tenantId, recipientId, text, platform);
    }

    @Post('send/attachment')
    @UseInterceptors(FileInterceptor('file'))
    sendAttachment(
        @TenantId() tenantId: string,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any
    ) {
        const { recipientId, platform, caption } = body;
        return this.messagesService.sendAttachment(tenantId, recipientId, platform, file, caption);
    }
}
