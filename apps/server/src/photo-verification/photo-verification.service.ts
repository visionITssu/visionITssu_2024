import { Injectable } from "@nestjs/common";
import * as sharp from "sharp";
import { Buffer } from "buffer";
import axios from "axios";


@Injectable()
export class VerificationService {
  async getVerification(file: Express.Multer.File): Promise<any> {
    const inputData = await this.preProcessImage(file);
    const inferenceData = await this.loadModelFromEC2(inputData);
    return await this.processResult(inferenceData);
  }

  async loadModelFromEC2(input: string): Promise<any> {
    try {
      const response = await axios.post("http://13.125.14.183:5001/process", {
        input: input, // Base64 인코딩된 이미지 데이터
      });
      return response.data; // Python에서 반환된 JSON 데이터를 반환
    } catch (error) {
      console.error("Error fetching prediction from model EC2:", error.message);
      throw new Error("Model inference failed");
    }
  }

  async preProcessImage(file: Express.Multer.File): Promise<string> {
    try {
      const pngBuffer = await sharp(file.buffer)
        .resize({ width: 640, height: 640 })
        .png()
        .toBuffer();
      return pngBuffer.toString("base64");
    } catch (error) {
      console.error("Error preprocessing image:", error.message);
      throw new Error("Image preprocessing failed");
    }
  }

  async processResult(
    predictions: any
  ): Promise<{ yolo: string[]; facePredictions: any }> {
    try {
      // YOLO와 facePredictions 데이터를 분리
      const yolo = predictions.yoloPrediction || [];
      const facePredictions = predictions.facePrediction || {};

      console.log("Processed Data:", { yolo, facePredictions });

      return { yolo, facePredictions };
    } catch (error) {
      console.error("Error processing predictions:", error.message);
      throw new Error("Prediction result processing failed");
    }
  }
}