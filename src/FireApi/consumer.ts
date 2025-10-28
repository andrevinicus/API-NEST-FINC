import { Injectable } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class NotificationsConsumer {
  constructor(private readonly firebaseService: FirebaseService) {}

  @RabbitSubscribe({
    exchange: 'notifications_exchange',
    routingKey: 'user_notifications',
    queue: 'user_notifications_queue',
  })
  async handleNotification(msg: any) {
    console.log('📥 Mensagem recebida da fila RabbitMQ:', msg);

    const payload = typeof msg === 'string' ? JSON.parse(msg) : msg;

    const token = await this.firebaseService.getUserToken(payload.idApp);
    if (!token) return;

    const title = `Novo lançamento: ${payload.tipo}`;
    const body = `${payload.detalhes} - Valor: ${payload.valorTotal}`;

    await this.firebaseService.sendNotification(token, title, body);
  }
}
