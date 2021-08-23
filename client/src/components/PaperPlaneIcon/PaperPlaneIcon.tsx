import { MouseEventHandler } from "react";
import "./PaperPlaneIcon.css";

export const PaperPlaneIcon = ({
  onClick,
}: {
  onClick: MouseEventHandler<HTMLSpanElement>;
}) => {
  return (
    <span className="chat-form-icon" onClick={onClick}>
      <i className="fa fa-paper-plane fa-2x"></i>
    </span>
  );
};
