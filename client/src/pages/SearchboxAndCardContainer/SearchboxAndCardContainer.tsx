import { ChangeEventHandler, useRef } from "react";
import { connect, ConnectedProps } from "react-redux";
import { CandidateCardList } from "../../components/Search/CandidateCardList/CandidateCardList";
import { RootState } from "../../utils/store";
import {
  thunkUpdateCreateButtonStatus,
  thunkUpdateSearchStatus,
} from "../../utils/thunk-middlewares";

import "./SearchboxAndCardContainer.css";

const _SearchboxAndCardContainer = ({
  selectedUsers,
  updateSearchStatus,
}: Props) => {
  const searchbox = useRef<HTMLInputElement>(null);

  const handleSearchBoxChange: ChangeEventHandler = async (e) => {
    updateSearchStatus(searchbox, selectedUsers);
    // updateCreateButtonStatus( selectedUsers, buttonDisabled);
  };

  return (
    <div className="channel-modal-searchbox-and-card-container">
      <div className="channel-modal-searchbox-container">
        <span className="channel-modal-form-span">Seach People</span>
        <input
          type="text"
          ref={searchbox}
          onChange={handleSearchBoxChange}
          className="channel-modal-searchbox"
          name="searchbox"
          id="searchbox"
        />
      </div>
      <CandidateCardList />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  selectedUsers: state.newChannel.selectedUsers,
});

const mapDispatchToProps = {
  updateSearchStatus: thunkUpdateSearchStatus,
  updateCreateButtonStatus: thunkUpdateCreateButtonStatus,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const SearchboxAndCardContainer = connector(_SearchboxAndCardContainer);
