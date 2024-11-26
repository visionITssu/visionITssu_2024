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
import * as fs from "fs";
import * as path from "path";
import axios from "axios";

@WebSocketGateway({
  namespace: "socket",
  cors: { origin: "*" },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  async handleDisconnect(client: Socket) {
    const clientDirectory = path.join(
      process.cwd(),
      "src",
      "socket_temp",
      client.id // 클라이언트별 폴더 삭제
    );
    await fs.promises.rm(clientDirectory, { recursive: true, force: true });
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

  @SubscribeMessage("stream")
  async handleStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: any
  ): Promise<any> {
    const imageBlob = message.image.replace(/^data:image\/\w+;base64,/, "");

    // Base64 유효성 검사
    if (!imageBlob || !imageBlob.startsWith("/9j/")) {
      client.emit("stream", { error: "Invalid image data" });
      return;
    }

    const uniqueId = `${Date.now()}_${client.id}`;
    const fileName = `${uniqueId}.txt`;
    const tempFilePath = path.join(
      process.cwd(),
      "src",
      "socket_temp",
      fileName
    );

    await fs.promises.mkdir(path.dirname(tempFilePath), { recursive: true });
    await fs.promises.writeFile(tempFilePath, imageBlob, "utf8");

    if (imageBlob) {
      try {
        Promise.all([this.loadModelFromEC2(imageBlob)])
          .then(async (result) => {
            const objectDetection = await this.processResult(result);
            client.emit("stream:complete", {
              objectDetection,
            });
          })
          .catch((error) => {
            console.error("Error processing validation:", error);
            client.emit("stream:error", {
              error: error.message || "Validation failed",
            });
          });
      } catch (error) {
        console.error("Error processing validation:", error);
        client.emit("stream", { error: error.message || "Validation failed" });
      } finally {
        // 임시 파일 삭제
        await fs.promises
          .unlink(tempFilePath)
          .catch((err) => console.error("Failed to delete temp file:", err));
      }
    }
  }
}
