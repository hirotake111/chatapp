import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../store";
import {
  thunkAddCandidateToExistingChannel,
  thunkGetUserByQuery,
  thunkRemoveCandidateFromExistingChannel,
  thunkUpdateMemberCandidateSearchStatus,
} from "../../thunk-middlewares";
import { SuggestedCardList } from "../SuggestedCardList/SugggestedCardList";
import { Searchbox } from "../Searchbox/Searchbox";

import "./SearchBoxAndCard.css";
import { CandidateList } from "../CandidateList/CandidateList";

const Component = ({
  searchStatus,
  highlightedChannel,
  candidates,
  updateSearchStatus,
  addCandidate,
  removeCandidate,
  getUserByQuery,
}: Props) => {
  return (
    <div className="searchbox-and-card-container">
      <Searchbox
        searchboxId="addMemberModalSearchbox"
        span="Search People"
        onEmptyCallback={() => updateSearchStatus({ type: "notInitiated" })}
        onChangeCallback={(query: string) =>
          getUserByQuery(query, candidates, highlightedChannel)
        }
      />
      <SuggestedCardList status={searchStatus} onCardClick={addCandidate} />
      <CandidateList candidates={candidates} onClick={removeCandidate} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  searchStatus: state.channel.searchStatus,
  highlightedChannel: state.channel.channels.filter(
    (ch) => ch.id === state.channel.highlighted?.id
  )[0],
  candidates: state.channel.candidates,
});

const mapDispatchToProps = {
  updateSearchStatus: thunkUpdateMemberCandidateSearchStatus,
  addCandidate: thunkAddCandidateToExistingChannel,
  removeCandidate: thunkRemoveCandidateFromExistingChannel,
  getUserByQuery: thunkGetUserByQuery,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type PropsFromParent = {};
type Props = PropsFromRedux & PropsFromParent;

export const SearchboxAndCard = connector(Component);
