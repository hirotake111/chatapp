import { MouseEventHandler } from "react";
import "./Button.css";

export const Button = ({
  value,
  enabled,
  onClick,
}: {
  value: string;
  enabled: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <button className="button" onClick={onClick} disabled={!enabled}>
      {value}
    </button>
  );
};
