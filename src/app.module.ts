import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/database/database.module';
import appConfig from '@config/app.config';
import databaseConfig from '@config/database.config';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import jwtConfig from '@config/jwt.config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtStrategy,
  ],
})
export class AppModule {}
