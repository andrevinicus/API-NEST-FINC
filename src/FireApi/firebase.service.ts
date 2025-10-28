import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import { config } from 'dotenv';

config(); // Carrega variáveis do .env globalmente

@Injectable()
export class FirebaseService implements OnModuleInit {
  private messaging!: admin.messaging.Messaging;

  onModuleInit() {
    if (!admin.apps.length) {
      const serviceAccountPath = process.env.FIREBASE_CREDENTIALS;

      if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
        throw new Error(
          `O arquivo de serviceAccount do Firebase não foi encontrado em: ${serviceAccountPath}`,
        );
      }

      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf-8'),
      ) as admin.ServiceAccount;

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('✅ Firebase Admin inicializado');
    }

    this.messaging = admin.messaging();
  }

  async getUserToken(idApp: string): Promise<string | null> {
    try {
      const userSnap = await admin.firestore().collection('users').doc(idApp).get();
      if (!userSnap.exists) {
        console.warn(`⚠️ Usuário ${idApp} não encontrado no Firestore.`);
        return null;
      }
      return userSnap.data()?.fcmToken || null;
    } catch (error) {
      console.error(`❌ Erro ao buscar token do usuário ${idApp}:`, error);
      return null;
    }
  }

  async sendNotification(token: string, title: string, body: string) {
    if (!token) {
      console.warn('⚠️ Token de usuário não fornecido.');
      return { success: false, error: 'Token inválido' };
    }

    try {
      const message: admin.messaging.Message = { token, notification: { title, body } };
      const response = await this.messaging.send(message);
      console.log('📨 Notificação enviada:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      return { success: false, error };
    }
  }
}
