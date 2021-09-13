import { Fragment } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Header } from "../../components/Common/Header/Header";
import { MainContainer } from "../MainContainer/MainContainer";
import { NewChannelModal } from "../NewChannelModal/NewChannelModal";

import { RootState } from "../../utils/store";
import { MemberModal } from "../../components/Member/MemberModal/MemberModal";

const Home = ({
  user: {
    userInfo: { username, userId },
  },
}: Props) => {
  return username && userId ? (
    <Fragment>
      <Header userId={userId} username={username} />
      <MainContainer />
      <NewChannelModal />
      <MemberModal />
    </Fragment>
  ) : (
    <Fragment>
      <p>No username or user ID</p>
    </Fragment>
  );
};

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export default connector(Home);
