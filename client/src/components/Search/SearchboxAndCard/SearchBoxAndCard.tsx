import { SearchboxForMemberModal } from "../SearchboxForMemberModal/SearchboxForMemberModal";
import { SuggestedCardListForMemberModal } from "../../Member/SuggestedCardListForMemberModal/SuggestedCardListForMemberModal";
import { CandidateListForMemberModal } from "../../Member/CandidateListForMemberModal/CandidateListForMemberModal";

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
