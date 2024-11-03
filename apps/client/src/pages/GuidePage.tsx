import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const GuidePage = () => {
  const navigate = useNavigate();

  const handleWebcamStartClick = () => {
    navigate("/webcam");
  };
  return (
    <Container>
      <Information>
        <InformationHeader>시작 전 안내</InformationHeader>
        <InformationContents>
          <div>1. 휴대폰 고정</div>
          <div>2. 규정 확인</div>
        </InformationContents>
      </Information>
      <Button type="cta" onClick={handleWebcamStartClick}>
        촬영 시작
      </Button>
    </Container>
  );
};

export default GuidePage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-image: url("../assets/plane.svg");
  background-size: cover;
  background-repeat: no-repeat;
`;
const Information = styled.div``;
const InformationHeader = styled.div``;
const InformationContents = styled.div``;
const Button = styled.button`
  margin: 8px;
  border: 1px solid #0c1870;
  border-radius: 12px;
  background-color: ${({ type }) => (type === "cta" ? "#0c1870" : "white")};
  color: ${({ type }) => (type === "cta" ? "white" : "#0c1870")};
  padding: 18px 16px;
  font-size: 18px;
  line-height: 32px;
  font-weight: 500;
`;
