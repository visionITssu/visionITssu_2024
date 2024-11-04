// // import { Injectable } from '@nestjs/common';
// // import { PythonShell } from 'python-shell';
// // import { promises as fs } from 'fs';
// // import * as path from 'path';
// // import * as tf from '@tensorflow/tfjs-node';
// // import axios from 'axios';

// // @Injectable()
// // export class VerificationService {
// //   model: tf.GraphModel;

// //   constructor() {
// //     this.loadModel();
// //   }

// //   async loadModel() {
// //     try {
// //       const modelPath = path.join(
// //         process.cwd(),
// //         'best_web_model',
// //         'model.json',
// //       );
// //       this.model = await tf.loadGraphModel(`file://${modelPath}`);
// //     } catch (error) {
// //       console.error('Error loading the model', error);
// //     }
// //   }
// //   checkAllTensorsKept(tensors) {
// //     // 배열 내의 모든 텐서가 kept === true 인지 확인
// //     const allKept = tensors.every((tensor) => tensor.kept);

// //     // 모든 텐서가 kept === true 이면 1 반환, 아니면 다른 값을 반환 (예: 0)
// //     return allKept ? 1 : 0;
// //   }
// //   checkScore(score) {
// //     const threshold = 0.5;
// //     //유효하지 않은 사진일 때
// //     if (score > threshold) {
// //       return 0;
// //     }
// //     return 1;
// //   }

// //   async getVerification(file: Express.Multer.File): Promise<any> {
// //     const fileName = `${Date.now()}.txt`;
// //     const tempFilePath = path.join(
// //       process.cwd(),
// //       'src',
// //       'verify_temp',
// //       fileName,
// //     );
// //     const arr = [];
// //     const score_arr = [];

// //     try {
// //       await fs.mkdir(path.dirname(tempFilePath), { recursive: true });
// //       await fs.writeFile(tempFilePath, file.buffer.toString('base64'), 'utf8');

// //       const imageBuffer = Buffer.from(file.buffer);
// //       const tensor = tf.node.decodeImage(imageBuffer, 3);
// //       const [modelWidth, modelHegiht] = this.model.inputs[0].shape.slice(1, 3);
// //       const input = tf.tidy(() => {
// //         return tf.image
// //           .resizeBilinear(tensor, [modelWidth, modelHegiht])
// //           .div(255.0)
// //           .expandDims(0);
// //       });

// //       try {
// //         const predictions = await this.model.executeAsync(input);
// //         //@ts-ignore
// //         const [boxes, scores, valid_detections] = predictions;
// //         const boxes_data = boxes.dataSync();
// //         const scores_data = scores.dataSync();
// //         //@ts-ignore
// //         const valid_detections_data = valid_detections.dataSync();
// //         for (let i = 0; i < valid_detections_data; i++) {
// //           boxes_data.slice(i * 4, (i + 1) * 4);
// //           score_arr.push(this.checkScore(scores_data[i].toFixed(2)));
// //         }
// //         const result = score_arr.every((value) => value !== 0) ? 1 : 0;
// //         arr.push(result);

// //         tf.dispose(tensor);
// //       } catch (error) {
// //         console.error('Error in YOLO model prediction:', error);
// //         throw error;
// //       }

// //       const options = {
// //         scriptPath: '',
// //         args: [tempFilePath],
// //       };

// //       const pythonShell = await PythonShell.run('Demo/validFace.py', options);
// //       const secondData = pythonShell[0].match(/-?\d+/g).map(Number);
// //       arr.push(...secondData);
// //       console.log(arr);
// //       return arr;
// //     } catch (error) {
// //       console.error('Error in VerificationService:', error);
// //       throw error;
// //     } finally {
// //       await fs.unlink(tempFilePath); // 임시 파일 삭제
// //     }
// //   }
// // }

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VerificationService {
  // EC2의 모델 서버 API를 호출하는 메서드
  async loadModelFromEC2(inputData) {
    try {
      const response = await axios.post('http://127.0.0.1:5001/predict', {
        input: inputData,
      });
      return response.data.prediction;
    } catch (error) {
      console.error('Error fetching prediction from model EC2:', error);
      throw error;
    }
  }

  async getVerification(file: Express.Multer.File): Promise<any> {
    // 파일을 처리하여 모델에 필요한 데이터 형식으로 변환
    const inputData = this.processFileToModelInput(file);

    // EC2의 모델 서버로부터 예측 결과 가져오기
    const prediction = await this.loadModelFromEC2(inputData);

    return prediction;
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

  processFileToModelInput(file) {
    // 이미지 파일을 모델의 입력 형식에 맞게 변환하는 로직 작성
    // 예: 이미지 파일을 읽어와서 base64로 인코딩 또는 필요한 전처리 수행
    const imageBuffer = Buffer.from(file.buffer);
    // 필요한 전처리 작업을 여기에 추가
    return imageBuffer.toString('base64'); // 예시로 base64 인코딩
  }
}
// import { Injectable } from '@nestjs/common';
// import * as tf from '@tensorflow/tfjs-node';
// import axios from 'axios';
// import * as path from 'path';
// import * as fs from 'fs/promises';
// import { PythonShell } from 'python-shell';

// @Injectable()
// export class VerificationService {
//   private EC2_MODEL_URL = 'http://13.125.187.238:5000/predict';

//   // EC2 모델 서버에 파일을 전송하고 예측 결과 가져오기
//   private async loadModelFromEC2(inputData: any): Promise<any> {
//     try {
//       const response = await axios.post(this.EC2_MODEL_URL, {
//         input: inputData,
//       });
//       return response.data.prediction;
//     } catch (error) {
//       console.error('Error loading model from EC2:', error);
//       throw new Error('Failed to fetch prediction from model server');
//     }
//   }

//   // 파일을 모델에 필요한 형식으로 변환
//   private processFileToModelInput(file: Express.Multer.File): any {
//     const buffer = Buffer.from(file.buffer);
//     const image = tf.node
//       .decodeImage(buffer, 3)
//       .resizeBilinear([640, 640])
//       .div(255.0)
//       .expandDims(0); // 모델 입력 형식에 맞게 크기 조정
//     return image.arraySync(); // 배열로 변환하여 JSON으로 전송할 수 있게 함
//   }

//   async getVerification(file: Express.Multer.File): Promise<any> {
//     const fileName = `${Date.now()}.txt`;
//     const tempFilePath = path.join(
//       process.cwd(),
//       'src',
//       'verify_temp',
//       fileName,
//     );
//     const arr = [];
//     const score_arr = [];

//     try {
//       // 임시 파일 생성
//       await fs.mkdir(path.dirname(tempFilePath), { recursive: true });
//       await fs.writeFile(tempFilePath, file.buffer.toString('base64'), 'utf8');

//       // 파일을 처리하여 모델에 필요한 데이터 형식으로 변환
//       const inputData = this.processFileToModelInput(file);

//       // EC2의 모델 서버로부터 예측 결과 가져오기
//       const predictions = await this.loadModelFromEC2(inputData);

//       // 예측 결과를 처리
//       const [boxes, scores, valid_detections] = predictions;
//       const boxes_data = boxes;
//       const scores_data = scores;
//       const valid_detections_data = valid_detections[0];

//       for (let i = 0; i < valid_detections_data; i++) {
//         const box = boxes_data.slice(i * 4, (i + 1) * 4);
//         score_arr.push(this.checkScore(scores_data[i].toFixed(2)));
//       }

//       const result = score_arr.every((value) => value !== 0) ? 1 : 0;
//       arr.push(result);

//       // Python 스크립트를 사용하여 추가 검증 수행
//       const options = {
//         scriptPath: '',
//         args: [tempFilePath],
//       };

//       const pythonShell = await PythonShell.run('Demo/validFace.py', options);
//       const secondData = pythonShell[0].match(/-?\d+/g).map(Number);
//       arr.push(...secondData);
//       console.log(arr);
//       return arr;
//     } catch (error) {
//       console.error('Error in VerificationService:', error);
//       throw error;
//     } finally {
//       // 임시 파일 삭제
//       await fs.unlink(tempFilePath);
//     }
//   }

//   // 예측 점수를 체크하는 메서드
//   private checkScore(score: string): number {
//     const threshold = 0.5; // 임계값 예시
//     return parseFloat(score) >= threshold ? 1 : 0;
//   }
// }
