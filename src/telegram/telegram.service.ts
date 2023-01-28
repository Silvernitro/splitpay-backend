import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import CryptoJS from 'crypto-js';

@Injectable()
export class TelegramService {
  constructor(private readonly configService: ConfigService) {}

  validateWebAppData(initDataString: string): boolean {
    const initData = new URLSearchParams(initDataString);
    const hash = initData.get('hash');
    const dataFields: string[] = [];

    initData.sort();
    initData.forEach(
      (val, key) => key !== 'hash' && dataFields.push(`${key}=${val}`),
    );

    const dataCheckString = dataFields.join('\n');
    const secret = CryptoJS.HmacSHA256(
      this.configService.get<string>('TELEGRAM_BOT_TOKEN'),
      'WebAppData',
    );
    const dataHash = CryptoJS.HmacSHA256(dataCheckString, secret).toString(
      CryptoJS.enc.Hex,
    );

    return dataHash === hash;
  }
}
