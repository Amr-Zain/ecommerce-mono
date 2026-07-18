import { Module } from '@nestjs/common';
import { AppSettingsService } from './settings.service';
import { AppSettingsRepository } from './settings.repository';

@Module({
  providers: [AppSettingsService, AppSettingsRepository],
  exports: [AppSettingsService],
})
export class SettingsModule {}
