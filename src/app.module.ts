import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // Carga el archivo .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conexión para Escritura
    TypeOrmModule.forRootAsync({
      name: 'write_connection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME_WRITE'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    // Conexión para Lectura
    TypeOrmModule.forRootAsync({
      name: 'read_connection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME_READ'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),

    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}