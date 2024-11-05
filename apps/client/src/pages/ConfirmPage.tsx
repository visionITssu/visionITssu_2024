import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CheckSymbol from "../assets/checkSymbol.svg";
import Toggle from "../assets/toggle.svg";
import { useState } from "react";

const ConfirmPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggleChecklist = () => {
    setIsOpen(!isOpen);
  };

  const handleRetakeClick = () => {
    navigate("/guide");
  };

  const handleCompleteClick = () => {
    navigate("/result");
  };

  const checklistArr: string[] = [
    "얼굴을 가리지 않았어요",
    "정면이에요",
    "무표정이에요",
    "빛이 충분해요",
    "착용물이 없어요",
  ];

  return (
    <Container>
      <Photo id="CameraContainer" />
      <Checklist id="Checklist" isOpen={isOpen}>
        <ChecklistHeader onClick={handleToggleChecklist}>
          마지막으로 확인했어요 <ToggleImg src={Toggle} alt="toggle" />
        </ChecklistHeader>
        {isOpen &&
          checklistArr.map((item, idx) => (
            <ChecklistContents key={idx}>
              <Check src={CheckSymbol} />
              {item}
            </ChecklistContents>
          ))}
      </Checklist>
      <ButtonContainer>
        <Button onClick={handleRetakeClick}>다시 촬영 (선택)</Button>
        <Button onClick={handleCompleteClick}>여권 사진 완성</Button>
      </ButtonContainer>
    </Container>
  );
};

export default ConfirmPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Photo = styled.img`
  width: 214px;
  height: 275px;
`;

const Checklist = styled.div<{ isOpen: boolean }>`
  width: 320px;
  height: 230px;
  border: 1px solid #0c1870;
  border-radius: 12px;
  background-color: #fff;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  transition:
    height 0.3s ease,
    bottom 0.3s ease;
  height: ${({ isOpen }) => (isOpen ? "300px" : "40px")};
  position: relative;
  bottom: ${({ isOpen }) => (isOpen ? "0px" : "-260px")};
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
  display: flex;
  width: 300px;
  justify-content: space-between;
`;

const ToggleImg = styled.img``;

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

const ButtonContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 600px;
`;

const Button = styled.button`
  margin-top: 20px;
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
