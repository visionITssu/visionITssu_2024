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
    const directoryPath = path.join(process.cwd(), "src", "socket_temp");
    await fs.promises.rm(directoryPath, { recursive: true, force: true });
  }

  // validFace API 호출 메서드
  async fetchValidationFromEC2(imageBase64: string): Promise<any> {
    try {
      const response = await axios.post("http://3.36.73.107:5001/analyze", {
        input: imageBase64,
      });
      return response.data.validation; // validFace API 결과
    } catch (error) {
      console.error("Error fetching validation from EC2:", error);
      throw new Error("Failed to fetch validation from EC2");
    }
  }

  @SubscribeMessage("stream")
  async handleStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: any
  ): Promise<any> {
    const imageBlob = message.image.replace(/^data:image\/\w+;base64,/, ""); // 'data:image/jpeg;base64,' 접두어 제거

    const fileName = `${Date.now()}.txt`;
    const tempFilePath = path.join(
      process.cwd(),
      "src",
      "socket_temp",
      fileName
    );
    await fs.promises.mkdir(path.dirname(tempFilePath), { recursive: true });
    await fs.promises.writeFile(
      tempFilePath,
      imageBlob.toString("base64"),
      "utf8"
    );

    if (imageBlob) {
      const arr = [];

      try {
        // for second data: 호출된 validFace API
        const ec2ValidationResult =
          await this.fetchValidationFromEC2(imageBlob);

        // validFace API 결과 추가
        arr.push(...ec2ValidationResult);

        console.log(arr);

        // 클라이언트로 결과 전송
        client.emit("stream", arr);
      } catch (error) {
        console.error("Error processing validation:", error);
        client.emit("stream", { error: "Validation failed" });
      }
    }
  }
}
