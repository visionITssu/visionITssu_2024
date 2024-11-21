// video-stream.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PythonShell } from "python-shell";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";

@WebSocketGateway(5003, {
  namespace: "socket",
  cors: { origin: "*" },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  async handleDisconnect(client: Socket) {
    const directoryPath = path.join(process.cwd(), "src", "socket_temp");
    await fs.promises.rm(directoryPath, { recursive: true, force: true });
  }

  // EC2의 모델 서버 API를 호출하는 메서드
  async fetchPredictionFromEC2(inputBase64: string) {
    try {
      const response = await axios.post("http://127.0.0.1:5001/predict", {
        input: inputBase64,
      });
      return response.data.prediction; // EC2에서 반환된 예측 결과
    } catch (error) {
      console.error("Error fetching prediction from EC2:", error);
      throw error;
    }
  }

  checkScore(score: number) {
    const threshold = 0.5;
    return score > threshold ? 0 : 1; // 스코어를 기반으로 유효성 판단
  }

  @SubscribeMessage("stream")
  async handleStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: any
  ): Promise<void> {
    try {
      const imageBase64 = message.image.replace(/^data:image\/\w+;base64,/, "");

      // EC2에서 예측 결과 가져오기
      const ec2Predictions = await this.fetchPredictionFromEC2(imageBase64);

      // 예측 결과를 처리
      const scoreArr = ec2Predictions.map((score) => this.checkScore(score));

      const firstResult = scoreArr.every((value) => value !== 0) ? 1 : 0;

      const options = {
        scriptPath: "", // 스크립트가 위치한 경로
        args: [imageBase64], // Python 스크립트에 전달할 인자
      };

      // Python 스크립트를 실행해 두 번째 데이터 처리
      const pythonShell = await PythonShell.run("Demo/validFace.py", options);
      const secondData = pythonShell[0]
        .match(/-?\d+|None/g)
        .map((item) => (item === "None" ? 0 : Number(item)));

      const finalResult = [firstResult, ...secondData];
      console.log("Final Result:", finalResult);

      // 클라이언트에 최종 결과 전달
      client.emit("stream", finalResult);
    } catch (error) {
      console.error("Error processing stream:", error);
      client.emit("stream", { error: "Failed to process stream." });
    }
  }
}
