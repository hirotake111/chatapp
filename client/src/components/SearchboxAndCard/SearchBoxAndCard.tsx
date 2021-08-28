import { SearchboxForMemberModal } from "../SearchboxForMemberModal/SearchboxForMemberModal";
import { SuggestedCardListForMemberModal } from "../SuggestedCardListForMemberModal/SuggestedCardListForMemberModal";
import { CandidateListForMemberModal } from "../CandidateListForMemberModal/CandidateListForMemberModal";

import "./SearchBoxAndCard.css";

export const SearchboxAndCard = () => {
  return (
    <div className="searchbox-and-card-container">
      <SearchboxForMemberModal />
      <SuggestedCardListForMemberModal />
      <CandidateListForMemberModal />
    </div>
  );
};
