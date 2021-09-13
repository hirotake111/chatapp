import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../../utils/store";
import {
  thunkGetUserByQuery,
  thunkUpdateMemberCandidateSearchStatus,
} from "../../../utils/thunk-middlewares";
import { Searchbox } from "../Searchbox/Searchbox";

const Component = ({
  candidates,
  highlightedChannel,
  updateSearchStatus,
  getUserByQuery,
}: Props) => (
  <Searchbox
    searchboxId="addMemberModalSearchbox"
    span="Search People"
    onEmptyCallback={() => updateSearchStatus({ type: "notInitiated" })}
    onChangeCallback={(query: string) =>
      getUserByQuery(query, candidates, highlightedChannel)
    }
  />
);

const mapStateToProps = (state: RootState) => ({
  candidates: state.channel.candidates,
  highlightedChannel: state.channel.channels.filter(
    (ch) => ch.id === state.channel.highlighted?.id
  )[0],
});

const mapDispatchToProps = {
  updateSearchStatus: thunkUpdateMemberCandidateSearchStatus,
  getUserByQuery: thunkGetUserByQuery,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export const SearchboxForMemberModal = connector(Component);
