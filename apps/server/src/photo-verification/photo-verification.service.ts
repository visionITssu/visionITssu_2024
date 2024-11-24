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
      const response = await axios.post("http://localhost:5001/predict", {
        input: input, // Base64 인코딩된 이미지 데이터
      });
      return response.data.prediction; // Python에서 반환된 JSON 데이터를 반환
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

  async processResult(predictions: any): Promise<number[]> {
    try {
      // 객체를 배열로 변환
      const predictionArray = predictions.output;

      //객체 검출 결과 반환
      const scoreArr = predictionArray.map((pred: any) => pred.name);

      return scoreArr;
    } catch (error) {
      console.error("Error processing predictions:", error.message);
      throw new Error("Prediction result processing failed");
    }
  }
}