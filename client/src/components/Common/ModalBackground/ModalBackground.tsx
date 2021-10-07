import { FC, MouseEventHandler } from "react";
import "./ModalBackground.css";

interface Props {
  id: string;
  enabled: boolean;
  onClick: MouseEventHandler;
}

export const ModalBackground: FC<Props> = ({
  id,
  enabled,
  onClick,
  children,
}) => {
  return (
    <div
      id={id}
      className="modal-background"
      style={{ display: enabled ? "flex" : "none" }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
