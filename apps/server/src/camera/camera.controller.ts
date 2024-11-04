import { Controller, Get } from '@nestjs/common';

@Controller('camera')
export class CameraController {
  @Get()
  getCameraData() {
    return { message: 'Camera endpoint is working!' };
  }
}
