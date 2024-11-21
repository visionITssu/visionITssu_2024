import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoEditService } from './photo-edit.service';

@Controller('photo-edit')
export class PhotoEditController {
  constructor(private readonly photoEditService: PhotoEditService) {}
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async handleImageUpload(@UploadedFile() file: Express.Multer.File) {
    return this.photoEditService.editHandler(file);
  }
}
