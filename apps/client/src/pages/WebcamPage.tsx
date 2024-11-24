import styled from "styled-components";
import { useEffect, useState, useRef } from "react";
import GuideLine from "../assets/guideLine.svg";
import CheckSymbol from "../assets/checkSymbol.svg";

const WebcamPage = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 414;

      const context = canvas.getContext("2d");
      if (!context) return;

      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      const videoAspectRatio = videoWidth / videoHeight;
      const canvasAspectRatio = canvas.width / canvas.height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (videoAspectRatio > canvasAspectRatio) {
        drawHeight = canvas.height;
        drawWidth = canvas.height * videoAspectRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = canvas.width / videoAspectRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(
        videoRef.current,
        offsetX,
        offsetY,
        drawWidth,
        drawHeight
      );
      context.setTransform(1, 0, 0, 1, 0, 0);
      const dataURL = canvas.toDataURL("image/jpeg");
      return dataURL;
    }
  };

  const handleCaptureClick = () => {
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      const imageData = captureImage();

      if (imageData) {
        const link = document.createElement("a");
        link.href = imageData;
        link.download = "captured_picture.jpg";
        link.click();
      }
    }
  };

  const handleMetadataLoad = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing webcam:", error);
      });
  }, []);

  const checklistArr: string[] = [
    "얼굴을 가리지 않았어요",
    "정면이에요",
    "무표정이에요",
    "빛이 충분해요",
    "착용물이 없어요",
  ];

  return (
    <Container>
      {isLoading ? "loading..." : ""}
      <CameraContainer id="CameraContainer">
        <Canvas ref={canvasRef} id="Canvas" />
        <Line src={GuideLine} alt="guide line" />
        <VideoContainer id="VideoContainer">
          <Video
            ref={videoRef}
            onLoadedMetadata={handleMetadataLoad}
            autoPlay
            loop
            muted
            playsInline
            id="Video"
          />
        </VideoContainer>
      </CameraContainer>
      <Checklist id="Checklist">
        {<ChecklistHeader>모든 규정을 지키면 촬영할 수 있어요</ChecklistHeader>}
        {checklistArr.map((item, idx) => (
          <ChecklistContents key={idx}>
            <Check src={CheckSymbol} />
            {item}
          </ChecklistContents>
        ))}
      </Checklist>
      <Button onClick={handleCaptureClick}>촬영</Button>
    </Container>
  );
};

export default WebcamPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url("../assets/plane.svg");
  background-size: cover;
  background-repeat: no-repeat;
`;

const CameraContainer = styled.div`
  width: 320px;
  height: 414px;
  top: 40px;
`;

const Canvas = styled.canvas`
  top: 40px;
  width: 320px;
  height: 414px;
`;

const Line = styled.img`
  position: relative;
  top: -414px;
  z-index: 1;
`;

const VideoContainer = styled.div`
  width: 320px;
  height: 414px;
  border-radius: 24px;
  position: absolute;
  top: 40px;
`;

const Video = styled.video`
  transform: scaleX(-1);
  object-fit: cover;
  width: 320px;
  height: 414px;
`;

const Checklist = styled.div`
  width: 320px;
  height: 230px;
  border: 1px solid #0c1870;
  border-radius: 12px;
  background-color: #fff;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: scroll;
`;

const ChecklistHeader = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 38px;
  letter-spacing: 1.2%;
  position: sticky;
  top: 0px;
  margin-left: 10px;
  background-color: #ffffff;
`;

const ChecklistContents = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 32px;
  letter-spacing: 1.2%;
  margin: 10px 20px;
  display: flex;
  flex-direction: row;
`;

const Check = styled.img`
  margin-right: 10px;
`;

const Button = styled.button`
  margin: 20px;
  border: 1px solid #b8b8b8;
  border-radius: 12px;
  background-color: #b8b8b8;
  color: white;
  padding: 18px 16px;
  font-size: 18px;
  line-height: 32px;
  font-weight: 500;
  width: 320px;
`;
