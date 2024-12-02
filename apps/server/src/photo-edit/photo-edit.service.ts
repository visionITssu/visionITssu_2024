import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import axios from "axios";
//import { PythonShell } from 'python-shell';

@Injectable()
export class PhotoEditService {
  async getEditedPhoto(file: Express.Multer.File): Promise<any> {
    try {
      const inputData = await this.preProcessImage(file);
      const editedPhoto = await this.loadModelFromEC2(inputData);
      return editedPhoto;
    } catch (error) {
      console.log("Error: ", error.message);
      throw new Error("photo-edit error");
    }
  }

  async loadModelFromEC2(input: Buffer): Promise<any> {
    try {
      const response = await axios.post("http://3.37.203.103:5001/crop", {
        //const response = await axios.post("http://localhost:5001/crop", {
        input: input, //이미지 데이터
      });
      return response.data; // Python에서 반환된 JSON 데이터를 반환
    } catch (error) {
      console.error("Error fetching crop from model EC2:", error.message);
      throw new Error("Model inference failed");
    }
  }

  async preProcessImage(file: Express.Multer.File): Promise<Buffer> {
    try {
      // const pngBuffer = file.buffer;
      // return pngBuffer.toString("base64");
      return file.buffer;
    } catch (error) {
      console.error("Error preprocessing image:", error.message);
      throw new Error("Image preprocessing failed");
    }
  }

  // async editHandler(file: Express.Multer.File): Promise<any> {
  //   try {
  //     const fileName = `${Date.now()}.txt`;
  //     const inputFilePath = path.join(
  //       process.cwd(),
  //       "src",
  //       "verify_temp",
  //       fileName
  //     );
  //     const imageBuffer = await fs.readFile(inputFilePath);

  //     const imageBase64 = imageBuffer.toString("base64");

  //     this.loadModelFromEC2(imageBase64);

  //     return `data:image/png;base64,${imageBase64}`;
  //   } catch (e) {
  //     console.log(e, "photo-edit error");
  //   }
  // }
}
