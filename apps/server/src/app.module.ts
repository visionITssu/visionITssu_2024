import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CameraModule } from "./camera/camera.module";
import { PhotoEditModule } from './photo-edit/photo-edit.module';
import { ExampleModule } from './example/example.module';
import { SocketModule } from './socket/socket.module';
import { VerificationModule } from './photo-verification/photo-verification.module';


@Module({
  imports: [
    CameraModule,
    PhotoEditModule,
    VerificationModule,
    ExampleModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
