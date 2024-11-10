import { Injectable } from "@nestjs/common";
import * as sharp from "sharp";
import { Buffer } from "buffer";
import axios from "axios";
import * as fs from "fs/promises";
import * as path from "path";
import * as tf from "@tensorflow/tfjs-node";

@Injectable()
export class VerificationService {
  //getVerification
  async getVerification(file: Express.Multer.File): Promise<any> {
    const inputData = await this.preProcessImage(file);
    const inferenceData = await this.loadModelFromEC2(inputData);
    return await this.processResult(inferenceData);
  }
  // EC2의 모델 서버 API를 호출하는 메서드
  async loadModelFromEC2(inputData) {
    try {
      const response = await axios.post("http://3.36.73.107:5001/predict", {
        input: inputData,
      });
      return response.data.prediction;
    } catch (error) {
      console.error("Error fetching prediction from model EC2:", error);
      throw error;
    }
  }
  //image를 전처리하는 함수
  async preProcessImage(file: Express.Multer.File) {
    try {
      const pngBuffer = await sharp(file.buffer)
        .resize({ width: 640, height: 640 }) // 모델 입력 크기에 맞게 조정
        .png()
        .toBuffer();
      const base64Image = pngBuffer.toString("base64"); // base64로 인코딩
      return base64Image;
    } catch (error) {
      console.log("Error processing Image: ", error);
      throw error;
    }
  }
  checkAllTensorsKept(tensors) {
    // 배열 내의 모든 텐서가 kept === true 인지 확인
    const allKept = tensors.every((tensor) => tensor.kept);

    // 모든 텐서가 kept === true 이면 1 반환, 아니면 다른 값을 반환 (예: 0)
    return allKept ? 1 : 0;
  }
  checkScore(score) {
    const threshold = 0.5;
    //유효하지 않은 사진일 때
    if (score > threshold) {
      return 0;
    }
    return 1;
  }
  async processResult(predictions: any) {
    try {
      //@ts-ignore
      const arr = [];
      const score_arr = [];
      const [boxes, scores, valid_detections] = predictions;
      const boxes_data = boxes;
      const scores_data = scores;
      //@ts-ignore
      const valid_detections_data = valid_detections;
      for (let i = 0; i < valid_detections_data; i++) {
        boxes_data.slice(i * 4, (i + 1) * 4);
        score_arr.push(this.checkScore(scores_data[i].toFixed(2)));
      }
      const result = score_arr.every((value) => value !== 0) ? 1 : 0;
      arr.push(result);

      return arr;
    } catch (error) {
      console.error("Error in YOLO model prediction:", error);
      throw error;
    }
  }
}
