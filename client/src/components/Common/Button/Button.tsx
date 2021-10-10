import { MouseEventHandler, ReactNode } from "react";
import "./Button.css";

export const Button = ({
  children,
  enabled,
  onClick,
}: {
  children: ReactNode;
  enabled: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <button className="button" onClick={onClick} disabled={!enabled}>
      {children}
    </button>
  );
};
