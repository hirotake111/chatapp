import { Header } from "../../components/Header/Header/Header";
import { NewChannelModal } from "../NewChannelModal/NewChannelModal";
import { MemberModal } from "../../components/Member/MemberModal/MemberModal";
import { LeftColumn } from "../../components/Column/LeftColumn/LeftColumn";
import { RightColumn } from "../../components/Column/RightColumn/RightColumn";

import { useAppSelector } from "../../hooks/reduxHooks";

import "./Home.css";
import { AppColumn } from "../../components/Column/AppColumn/AppColumn";

const Home = () => {
  const { userInfo } = useAppSelector((state) => state.user);

  return userInfo && userInfo.username && userInfo.userId ? (
    <div style={{ display: "flex" }}>
      <AppColumn />
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
