import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { RootProvider } from "./providers/RootProvider";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import GuidePage from "./pages/GuidePage";
import WebcamPage from "./pages/WebcamPage";
import { styled } from "styled-components";

function App() {
  return (
    <RootProvider>
      <Wrapper>
        <PageWrapper>
          <RouterProvider router={router} />
        </PageWrapper>
      </Wrapper>
    </RootProvider>
  );
}

export default App;

const routes = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/guide",
    element: <GuidePage />,
  },
  {
    path: "/webcam",
    element: <WebcamPage />,
  },
  {
    path: "/check",
    element: <></>,
  },
  {
    path: "/result",
    element: <></>,
  },
];

const router = createBrowserRouter(routes);

const Wrapper = styled.div`
  padding: "0 27.5px";
  width: "100%";
  height: "100%";
  box-sizing: "border-box";
  display: "flex";
  flex-direction: "column";
  align-items: "center";
`;

const PageWrapper = styled.div`
  width: "100%";
  max-width: "$bp2";
  position: "relative";
`;
