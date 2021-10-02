import App from "./App";

import { useSignIn } from "./hooks/userHooks";

export const Root = () => {
  const [user, signin] = useSignIn();
  return <App user={user} signin={signin} />;
};
