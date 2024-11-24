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

  async fetchValidationFromEC2(imageBase64: string): Promise<any> {
    try {
      const response = await axios.post("http://127.0.0.1:5001/valid", {
        input: imageBase64,
      });
      // validations 객체만 반환
      return response.data || {};
    } catch (error) {
      console.error("Error fetching validation from EC2:", error.message);
      throw new Error("Failed to fetch validation from EC2");
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
        // EC2에서 validations 객체 가져오기
        const validations = await this.fetchValidationFromEC2(imageBlob);
        console.log(validations);

        // 숫자 값만 배열로 추출
        const validationArray = Object.values(validations);

        console.log(validationArray);

        // 클라이언트로 전송
        client.emit("stream", validationArray);
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
