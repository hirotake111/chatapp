import { FC, MouseEventHandler } from "react";
import "./ModalBackground.css";

interface Props {
  id: string;
  enabled: boolean;
  onClick: (enabled: boolean) => void;
}

export const ModalBackground: FC<Props> = ({
  id,
  enabled,
  onClick,
  children,
}) => {
  const handleClickBackgrond: MouseEventHandler = () => {
    onClick(!enabled);
  };

  return (
    <div
      id={id}
      className="modal-background"
      style={{ display: enabled ? "flex" : "none" }}
      onClick={handleClickBackgrond}
    >
      {children}
    </div>
  );
};
