import { SuggestedUser } from "../SuggestedUser/SuggestedUser";
import "./CandidateList.css";

type Props = {
  candidates: SearchedUser[];
  onClick: (candidate: SearchedUser) => void;
};

export const CandidateList = ({ candidates, onClick }: Props) => {
  return (
    <div className="suggested-card-list">
      {candidates.map((user) => (
        <SuggestedUser
          key={user.id}
          id={user.id}
          displayName={user.displayName}
          onClick={() => onClick(user)}
        />
      ))}
    </div>
  );
};
