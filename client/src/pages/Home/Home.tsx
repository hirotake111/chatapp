import { Header } from "../../components/Common/Header/Header";
import { MainContainer } from "../MainContainer/MainContainer";
import { NewChannelModal } from "../NewChannelModal/NewChannelModal";
import { MemberModal } from "../../components/Member/MemberModal/MemberModal";

import { useAppSelector } from "../../hooks/reduxHooks";

const Home = () => {
  const { userInfo } = useAppSelector((state) => state.user);
  return userInfo && userInfo.username && userInfo.userId ? (
    <>
      <Header userId={userInfo.userId} username={userInfo.username} />
      <MainContainer />
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
