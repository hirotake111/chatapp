import { MouseEvent } from "react";
import "./SuggestedUser.css";

export const SuggestedUser = ({
  id,
  displayName,
  onClick,
}: {
  id: string;
  displayName: string;
  onClick: (e: MouseEvent) => void;
}) => {
  const handleClick = (e: MouseEvent) => onClick(e);

  return (
    <div id={id} className="suggested-user">
      <span>{displayName}</span>
      <span className="remove-candidate" onClick={handleClick}>
        &times;
      </span>
    </div>
  );
};
