// video-stream.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PythonShell } from 'python-shell';
import * as fs from 'fs';
import * as path from 'path';
import * as tf from '@tensorflow/tfjs-node';

@WebSocketGateway(5003, {
  namespace: 'socket',
  cors: { origin: '*' },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;
  model: tf.GraphModel;
  constructor() {
    this.loadModel();
  }

  async handleDisconnect(client: Socket) {
    const directoryPath = path.join(process.cwd(), 'src', 'socket_temp');
    await fs.promises.rm(directoryPath, { recursive: true, force: true });
  }

  async loadModel() {
    try {
      const modelPath = path.join(
        process.cwd(),
        'best_web_model',
        'model.json',
      );
      this.model = await tf.loadGraphModel(`file://${modelPath}`);
    } catch (error) {
      console.error('Error loading the model', error);
    }
  }

  checkScore(score) {
    const threshold = 0.5;
    //유효하지 않은 사진일 때
    if (score > threshold) {
      return 0;
    }
    return 1;
  }

  checkAllTensorsKept(tensors) {
    // 배열 내의 모든 텐서가 kept === true 인지 확인
    const allKept = tensors.every((tensor) => tensor.kept);

    // 모든 텐서가 kept === true 이면 1 반환, 아니면 다른 값을 반환 (예: 0)
    return allKept ? 1 : 0;
  }

  @SubscribeMessage('stream')
  async handleStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: any,
  ): Promise<any> {
    const imageBlob = message.image.replace(/^data:image\/\w+;base64,/, ''); // 'data:image/jpeg;base64,' 접두어 제거
    const imageBase64 = message.image.replace(/^data:image\/\w+;base64,/, ''); // 'data:image/jpeg;base64,' 접두어 제거

    const fileName = `${Date.now()}.txt`;
    const tempFilePath = path.join(
      process.cwd(),
      'src',
      'socket_temp',
      fileName,
    );
    await fs.promises.mkdir(path.dirname(tempFilePath), { recursive: true });
    await fs.promises.writeFile(
      tempFilePath,
      imageBlob.toString('base64'),
      'utf8',
    );
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const tensor = tf.node.decodeImage(imageBuffer, 3);
    const [modelWidth, modelHegiht] = this.model.inputs[0].shape.slice(1, 3);
    const input = tf.tidy(() => {
      return tf.image
        .resizeBilinear(tensor, [modelWidth, modelHegiht])
        .div(255.0)
        .expandDims(0);
    });

    if (imageBlob) {
      const options = {
        scriptPath: '', // 스크립트가 위치한 경로
        args: [tempFilePath], // Python 스크립트에 전달할 인자들
      };

      const arr = [];
      const score_arr = [];

      // for first data
      const predictions = await this.model.executeAsync(input);
      //@ts-ignore
      const [boxes, scores, classes, valid_detections] = predictions;
      const boxes_data = boxes.dataSync();
      const scores_data = scores.dataSync();
      const classes_data = classes.dataSync();
      //@ts-ignore
      const valid_detections_data = valid_detections.dataSync();
      for (let i = 0; i < valid_detections_data; i++) {
        boxes_data.slice(i * 4, (i + 1) * 4);
        console.log(classes_data[i]);
        console.log(scores_data[i].toFixed(2));

        score_arr.push(this.checkScore(scores_data[i].toFixed(2)));
      }
      const result = score_arr.every((value) => value !== 0) ? 1 : 0;
      //console.log(result);
      arr.push(result);

      // for second data
      const pythonShell = await PythonShell.run('Demo/validFace.py', options);
      console.log(pythonShell);
      const secondData = pythonShell[0]
        .match(/-?\d+|None/g)
        .map((item) => (item === 'None' ? 0 : Number(item)));
      arr.push(...secondData);
      console.log(arr);
      client.emit('stream', arr);
    }
  }
}
