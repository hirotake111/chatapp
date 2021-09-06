import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../../utils/store";
import { thunkRemoveCandidateFromExistingChannel } from "../../../utils/thunk-middlewares";
import { CandidateList } from "../../Search/CandidateList/CandidateList";

const Component = ({ candidates, removeCandidate }: Props) => (
  <CandidateList candidates={candidates} onClick={removeCandidate} />
);

const mapStateToProps = (state: RootState) => ({
  candidates: state.channel.candidates,
});

const mapDispatchToProps = {
  removeCandidate: thunkRemoveCandidateFromExistingChannel,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export const CandidateListForMemberModal = connector(Component);
