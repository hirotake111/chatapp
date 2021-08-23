import { MouseEvent } from "react";
import "./CandidateCard.css";

export const CandidateCard = ({
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
    <span className="candidate-card-container" onClick={handleClick}>
      {name}
    </span>
  );
};
