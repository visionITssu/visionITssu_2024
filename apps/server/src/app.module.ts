import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from "./app.service";
import { PhotoEditModule } from "./photo-edit/photo-edit.module";
import { SocketModule } from './socket/socket.module';
import { VerificationModule } from './photo-verification/photo-verification.module';


@Module({
  imports: [PhotoEditModule, VerificationModule, SocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
