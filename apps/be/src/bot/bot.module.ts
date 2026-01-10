import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NezonModule } from '@nezon';
import { BotCronModule } from '@src/bot/cron/bot-cron.module';
import ChannelMessageHandler from '@src/bot/handler/channel-message.handler';
import { DatabaseModule } from '@src/common/database/database.module';
import { AppConfigService } from '@src/common/shared/services/app-config.service';
import { SharedModule } from '@src/common/shared/shared.module';
import { BotNotiDeliveryService } from '@src/modules/bot-noti/bot-noti-delivery.service';
import ChannelConfigEntity from '@src/modules/channel/channel-config.entity';
import { MezonClient } from 'mezon-sdk';

@Module({
  imports: [
    SharedModule,
    NezonModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: async (config: AppConfigService) => config.botConfig,
    }),
    DatabaseModule,
    BotCronModule,
    TypeOrmModule.forFeature([ChannelConfigEntity]),
  ],
  providers: [ChannelMessageHandler, BotNotiDeliveryService],
})
export class BotModule {
  private readonly logger = new Logger('BotModule');

  constructor(private mezonClient: MezonClient) {
    this.mezonClient.on('ready', async () => {
      this.logger.log('🤖 Mezon Client is ready!');
    });
  }
}
