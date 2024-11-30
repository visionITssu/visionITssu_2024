import { Button } from "@repo/ui/button";
import { styled } from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axios.config";

const AlbumUploadPage = () => {
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const [selectedImg, setSelectedImg] = useState<string>(
    queryParams.get("image") ?? ""
  );

  const handleReuploadClick = () => {
    if (selectedImg) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const imgUrl = reader.result as string;
            setSelectedImg(imgUrl);
            navigate(`/album?image=${encodeURIComponent(imgUrl)}`);
          };
          reader.readAsDataURL(file);
        } else {
          setSelectedImg("");
        }
      };
      input.click();
    } else {
      return;
    }
  };

  const base64ToBlob = (base64: string) => {
    const byteString = atob(base64.split(",")[1]);
    const byteArray = new Uint8Array(byteString.length);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];

    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([byteArray], { type: mimeString });
  };

  const handleUploadClick = async () => {
    if (selectedImg) {
      const blob = base64ToBlob(selectedImg);
      const formData = new FormData();
      formData.append("image", blob);

      console.log("formatData", formData);

      try {
        const res = await axiosInstance.post("/photo-edit", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const resToUrl = `confirm?image=${encodeURIComponent(res.data)}`;
        console.log(resToUrl);
        setSelectedImg(resToUrl);
        navigate(`/${resToUrl}`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <Container>
      <SelectedPhoto src={selectedImg}></SelectedPhoto>
      <ButtonContainer>
        <Button className="second" clickButton={handleReuploadClick}>
          다시 선택
        </Button>
        <Button className="primary" clickButton={handleUploadClick}>
          선택 완료
        </Button>
      </ButtonContainer>
    </Container>
  );
};

export default AlbumUploadPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SelectedPhoto = styled.img`
  width: 320px;
  height: 540px;
  background-color: #f0f0f0;
  border: 0px solid;
  border-radius: 24px;
`;

const ButtonContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 600px;
  width: 86vw;
`;
