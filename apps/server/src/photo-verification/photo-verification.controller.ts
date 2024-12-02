
import { Controller, Post, Body } from "@nestjs/common";
//import { FileInterceptor } from '@nestjs/platform-express';
import { VerificationService } from "./photo-verification.service";

@Controller("verification")
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  async handleImageUpload(@Body("image") image: string) {
    if (!image) {
      throw new Error("Image data is required");
    }
    return this.verificationService.getVerification(image);
  }
}
