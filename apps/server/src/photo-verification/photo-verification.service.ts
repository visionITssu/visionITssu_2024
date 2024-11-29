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
      //const response = await axios.post("http://localhost:5001/process", {
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
  ): Promise<{ tempVerificationResult: any }> {
    try {
      // YOLO와 facePredictions 데이터를 분리
      const yolo = predictions.yoloPrediction || [];
      const facePredictions = predictions.facePrediction || {};

      let tempVerificationResult = [0, 0, 0, 0, 0]; // 기본값 0으로 초기화

      // 조건 1: YOLO 결과 확인
      if (!yolo || yolo.length === 0) {
        tempVerificationResult[0] = 1; // yolo가 비어있을 경우 1
      } else {
        tempVerificationResult[0] = 1; // yolo에 값이 있으면 1
      }

      // 조건 2: 얼굴 밝기와 눈썹
      if (
        facePredictions.valid_face_brightness === 1 &&
        facePredictions.valid_eyebrow === 1
      ) {
        tempVerificationResult[1] = 1;
      }

      // 조건 3: 얼굴 정면 확인
      if (
        facePredictions.valid_face_horizon === 1 &&
        facePredictions.valid_face_vertical === 1
      ) {
        tempVerificationResult[2] = 1;
      }

      // 조건 4: 표정 확인
      if (
        facePredictions.valid_mouth_openness === 1 &&
        facePredictions.valid_mouth_smile === 1
      ) {
        tempVerificationResult[3] = 1;
      }

      // 조건 5: 얼굴 밝기 단독 확인
      if (facePredictions.valid_face_brightness === 1) {
        tempVerificationResult[4] = 1;
      }
      return { tempVerificationResult };
    } catch (error) {
      console.error("Error processing predictions:", error.message);
      throw new Error("Prediction result processing failed");
    }
  }
}