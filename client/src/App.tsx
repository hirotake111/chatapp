import { MouseEventHandler, useEffect, useState } from "react";

import Home from "./pages/Home/Home";
import { LoadingSpinner } from "./components/Common/LoadingSpinner/LoadingSpinner";
import { DisplayWrapper } from "./components/Common/DisplayWrapper/DisplayWrapper";
import { useSignIn, useToggleUserModal } from "./hooks/userHooks";

export default function App() {
  // const [{ isAuthenticated: result }, b] = useSignIn();
  const [{ isAuthenticated }, signin] = useSignIn();
  const [isMobile, setIsMobile] = useState(true);
  const toggle = useToggleUserModal();

  /**
   * this invokes callback only if class name is not "profile-modal"
   */
  const handleClick: MouseEventHandler = (e) => {
    e.preventDefault();
    const element = e.target as HTMLElement;
    // if user clicks inside .profile-modal, then return;
    if (element.closest(".profile-modal")) return;
    // else, invoke toggle callback
    toggle({ enable: false });
  };

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
    <div className="App" onClick={handleClick}>
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
