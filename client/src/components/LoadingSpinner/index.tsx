import { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";

import { thunkSignIn } from "../../thunk-middlewares";
import { RootState } from "../../store";

import "./style.css";

const LoadingSpinner = ({ signinEnabled, signIn }: Props) => {
  useEffect(() => {
    if (signinEnabled) {
      try {
        setTimeout(signIn, 500);
      } catch (e) {
        console.log("errror while signing in:", e.mesage);
        throw e;
      }
    }
  }, [signinEnabled, signIn]);

  return (
    <div className="loading-parent">
      <div className="dots-1"></div>
      <p className="loading-text">LOADING NOW...</p>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({ user: state.user });

const mapDispatchToProps = {
  signIn: () => thunkSignIn(),
  signOut: () => ({ type: "user/signedOut" }),
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & { signinEnabled: boolean };

export default connect(mapStateToProps, mapDispatchToProps)(LoadingSpinner);
