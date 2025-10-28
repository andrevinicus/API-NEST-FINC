import { Module } from '@nestjs/common';

import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { NotificationsConsumer } from './consumer';
import { FirebaseService } from './firebase.service';


@Module({
  imports: [
    RabbitMQModule.forRoot({
      exchanges: [{ name: 'notifications_exchange', type: 'direct' }],
      uri: process.env.RABBITMQ_URI,
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [FirebaseService, NotificationsConsumer],
})
export class NotificationsModule {}
