import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { PythonShell } from 'python-shell';

@Injectable()
export class PhotoEditService {
  async editHandler(file: Express.Multer.File): Promise<any> {
    try {
      const fileName = `${Date.now()}.txt`;
      const inputFilePath = path.join(
        process.cwd(),
        'src',
        'verify_temp',
        fileName,
      );
      const outputImagePath = path.join(process.cwd(), 'temp.png');

      const options = {
        scriptPath: '',
        args: [inputFilePath],
      };

      await fs.mkdir(path.dirname(inputFilePath), { recursive: true });
      await fs.writeFile(inputFilePath, file.buffer.toString('base64'), 'utf8');
      await PythonShell.run('Demo/cropface.py', options);

      const imageBuffer = await fs.readFile(outputImagePath);
      console.log(imageBuffer);
      const imageBase64 = imageBuffer.toString('base64');
      console.log(imageBase64);

      return `data:image/png;base64,${imageBase64}`;
    } catch (e) {
      console.log(e, 'photo-edit error');
    }
  }
}
