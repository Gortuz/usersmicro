import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Registrar filtro global para capturar excepciones en contexto RPC
  app.useGlobalFilters(new AllExceptionsFilter());

  const kafkaBrokers = configService.get<string>('KAFKA_BROKERS', 'localhost:9092');
  const clientId = configService.get<string>('KAFKA_CLIENT_ID', 'users-service');
  const groupId = configService.get<string>('KAFKA_CONSUMER_GROUP_ID', 'users-consumer');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: clientId,
        brokers: kafkaBrokers.split(','),
      },
      consumer: {
        groupId: groupId,
      },
    },
  });

  // Ensure lifecycle hooks run so CQRS can discover and register handlers.
  await app.init();
  await app.startAllMicroservices();

  console.log(`🚀 Microservice is listening on Kafka brokers: ${kafkaBrokers}`);
}
bootstrap();