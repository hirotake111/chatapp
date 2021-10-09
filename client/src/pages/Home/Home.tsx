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
    <>
      <Header />
      <div className="main">
        <LeftColumn />
        <RightColumn />
      </div>
      <NewChannelModal />
      <MemberModal />
    </>
  ) : (
    <>
      <p>No username or user ID</p>
    </>
  );
};

export default Home;
