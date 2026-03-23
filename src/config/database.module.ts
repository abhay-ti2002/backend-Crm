import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');

        if (!uri) {
          throw new Error('❌ MONGO_URI is not defined');
        }

        return {
          uri,
          connectionFactory: (connection: Connection) => {
            connection.on('connected', () => {
              console.log('✅ MongoDB connected successfully');
            });

            connection.on('error', (err) => {
              console.error('❌ MongoDB connection error:', err);
            });

            return connection;
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
