
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerificationService } from './photo-verification.service';


@Controller('verification')
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) { }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async handleImageUpload(@UploadedFile() file: Express.Multer.File) {
        return this.verificationService.getVerification(file);
    }
}
