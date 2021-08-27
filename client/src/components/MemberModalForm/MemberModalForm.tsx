import { CandidateCardList } from "../CandidateCardList/CandidateCardList";
import { SearchboxAndCard } from "../SearchboxAndCard/SearchBoxAndCard";

import "./MemberModalForm.css";

export const MemberModalForm = () => {
  return (
    <div id="modal-content" className="modal-content">
      <span className="modal-content-title">
        Add new member to this channel
      </span>
      <span className="modal-content-span">
        Start typing a name to add new users to your channel
      </span>
      <SearchboxAndCard />
      <CandidateCardList />
    </div>
  );
};
