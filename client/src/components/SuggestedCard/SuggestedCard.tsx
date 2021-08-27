import { MouseEvent } from "react";

import "./SuggestedCard.css";

export const SuggestedCard = ({
  name,
  onClick,
}: {
  name: string;
  onClick?: () => void;
}) => {
  const handleClick = (e: MouseEvent) => {
    if (onClick) onClick();
  };

  return (
    <span className="suggested-card-container" onClick={handleClick}>
      {name}
    </span>
  );
};
