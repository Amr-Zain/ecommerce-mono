import { Module } from '@nestjs/common';
import { AppSettingsService } from './settings.service';

@Module({
  providers: [AppSettingsService],
  exports: [AppSettingsService],
})
export class SettingsModule {}
