import { useEffect, useState } from "react";

import Home from "./pages/Home/Home";
import { LoadingSpinner } from "./components/Common/LoadingSpinner/LoadingSpinner";
import { DisplayWrapper } from "./components/Common/DisplayWrapper/DisplayWrapper";
import { useSignIn } from "./hooks/userHooks";

export default function App() {
  // const [{ isAuthenticated: result }, b] = useSignIn();
  const [{ isAuthenticated }, signin] = useSignIn();
  const [isMobile, setIsMobile] = useState(true);

  /**
   * Determine user's device based on window.innerWidth.
   * if it's not a mobile device then set the value as false
   */
  useEffect(() => {
    if (window.innerWidth > 400) setIsMobile(false);
  }, [isMobile]);

  /**
   * App component will display Home if the user is authenticated,
   * otherwise display a loading spinner
   */
  return (
    <div className="App">
      <DisplayWrapper
        showMessage={isMobile}
        message="Unforunately, mobile device is not supported now."
      >
        {isAuthenticated ? (
          <Home />
        ) : (
          <LoadingSpinner enabled={!isMobile} callback={signin} ms={300} />
        )}
      </DisplayWrapper>
    </div>
  );
}
