import { Body, Controller, Post } from '@nestjs/common';
import telegramDataDto from './dto/telegram-data.dto';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('validateData')
  validateTelegramData(@Body() telegramData: telegramDataDto) {
    return this.telegramService.validateWebAppData(telegramData.initData);
  }
}
