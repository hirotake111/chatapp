import { MouseEventHandler } from "react";
import "./Button.css";

export const Button = ({
  value,
  onClick,
}: {
  value: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <button className="new-channel-button" onClick={onClick}>
      {value}
    </button>
  );
};
