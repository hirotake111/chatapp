import { connect, ConnectedProps } from "react-redux";

import App from "./App";

import { RootState } from "./utils/store";

const mapStateToProps = (state: RootState) => ({
  user: state.user,
});

const connector = connect(mapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const Root = connector(({ user }: Props) => <App user={user} />);
