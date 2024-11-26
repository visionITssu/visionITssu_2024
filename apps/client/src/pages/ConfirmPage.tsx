import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CheckSymbol from "../assets/checkSymbol.svg?react";
import Toggle from "../assets/toggle.svg";
import { useState } from "react";
import { Button } from "@repo/ui/button";

const ConfirmPage = () => {
  const [isOpen, setIsOpen] = useState(true);
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

  const tempVerificationResult = [1, 0, 1, 0, 0];
  const checklistArr: string[] = [
    "착용물이 없어요",
    "얼굴을 가리지 않았어요",
    "정면이에요",
    "무표정이에요",
    "빛이 충분해요",
  ];

  return (
    <Container>
      <Photo id="CameraContainer" />
      <Checklist id="Checklist" isOpen={isOpen}>
        <ChecklistHeader onClick={handleToggleChecklist}>
          마지막으로 확인했어요 <ToggleImg src={Toggle} alt="toggle" />
        </ChecklistHeader>
        {isOpen &&
          tempVerificationResult
            .sort((a, b) => a - b)
            .map((item, idx) => (
              <ChecklistContents key={idx} active={item}>
                <Check active={item} />
                {checklistArr[idx]}
              </ChecklistContents>
            ))}
      </Checklist>
      <ButtonContainer>
        <Button className={"second"} clickButton={handleRetakeClick}>
          다시 촬영 (선택)
        </Button>
        <Button className={"primary"} clickButton={handleCompleteClick}>
          여권 사진 완성
        </Button>
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

const ChecklistContents = styled.div<{ active?: number }>`
  font-weight: 600;
  font-size: 16px;
  line-height: 32px;
  letter-spacing: 1.2%;
  margin: 10px 20px;
  display: flex;
  flex-direction: row;
  color: ${({ active, theme }) => (active ? theme.colors.blue : "gray")};
`;

const Check = styled(CheckSymbol)<{ active?: number }>`
  margin-right: 10px;
  path {
    stroke: ${({ active, theme }) => (active ? theme.colors.blue : "gray")};
  }
`;

const ButtonContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 600px;
  width: 86vw;
`;
