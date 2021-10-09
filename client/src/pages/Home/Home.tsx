import { Header } from "../../components/Header/Header/Header";
import { NewChannelModal } from "../NewChannelModal/NewChannelModal";
import { MemberModal } from "../../components/Member/MemberModal/MemberModal";
import { LeftColumn } from "../LeftColumn/LeftColumn";
import { RightColumn } from "../RightColumn/RightColumn";

import { useAppSelector } from "../../hooks/reduxHooks";

import "./Home.css";

const Home = () => {
  const { userInfo } = useAppSelector((state) => state.user);

  return userInfo && userInfo.username && userInfo.userId ? (
    <div
      style={{
        display: "flex",
      }}
    >
      <div
        id="app-column"
        style={{
          width: "60px",
          background: "#070e0c",
        }}
      ></div>
      <div style={{ width: "100%" }}>
        <Header />
        <div className="main">
          <LeftColumn />
          <RightColumn />
        </div>
        <NewChannelModal />
        <MemberModal />
      </div>
    </div>
  ) : (
    <>
      <p>No username or user ID</p>
    </>
  );
};

export default Home;
