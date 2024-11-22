
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerificationService } from "./photo-verification.service";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
} from "@nestjs/swagger";
import { image } from "@tensorflow/tfjs";

@Controller("verification")
@ApiTags("사진 검증 API")
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  @ApiOperation({
    summary: " 사진 검증 API",
    description: "yolo 모델을 통해 사진을 검증한다.",
  })
  @ApiCreatedResponse({
    description: "yolo 모델을 통해 사진을 검증한다.",
    type: File,
  })
  @UseInterceptors(FileInterceptor("image"))
  async handleImageUpload(@UploadedFile() file: Express.Multer.File) {
    return this.verificationService.getVerification(file);
  }
}
