import { connect, ConnectedProps } from "react-redux";

import App from "./App";

import { RootState } from "./utils/store";
import { thunkSignIn } from "./utils/thunk-middlewares";

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});
const mapDispatchToProps = {
  sigin: thunkSignIn,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const Root = connector(({ user, sigin }: Props) => (
  <App user={user} signin={sigin} />
));
