import { MouseEventHandler } from "react";
import "./CustomButton.css";

export const CustomButton = ({
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
