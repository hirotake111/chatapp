import { ReactNode } from "react";

import "./DisplayWrapper.css";

export const DisplayWrapper = ({
  showMessage,
  message,
  children,
}: {
  showMessage: boolean;
  message: string;
  children: ReactNode;
}) => {
  return (
    <>
      {showMessage ? (
        <div className="wrapper-message-container">
          <span>{message}</span>
        </div>
      ) : (
        children
      )}
    </>
  );
};
