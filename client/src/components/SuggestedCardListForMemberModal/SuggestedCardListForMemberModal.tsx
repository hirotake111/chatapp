import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../store";
import { thunkAddCandidateToExistingChannel } from "../../thunk-middlewares";
import { SuggestedCardList } from "../SuggestedCardList/SugggestedCardList";

const Component = ({ searchStatus, addCandidate }: Props) => (
  <SuggestedCardList status={searchStatus} onCardClick={addCandidate} />
);

const mapStateToProps = (state: RootState) => ({
  searchStatus: state.channel.searchStatus,
});

const mapDispatchToProps = {
  addCandidate: thunkAddCandidateToExistingChannel,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export const SuggestedCardListForMemberModal = connector(Component);
