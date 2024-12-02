
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerificationService } from "./photo-verification.service";


@Controller("verification")
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  @UseInterceptors(FileInterceptor("image"))
  async handleImageUpload(input: string) {
    return this.verificationService.getVerification(input);
  }
}
