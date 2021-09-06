import { ChangeEventHandler, MouseEvent } from "react";
import { connect, ConnectedProps } from "react-redux";
import { SuggestedUser } from "../../components/Search/SuggestedUser/SuggestedUser";

import { RootState } from "../../utils/store";
import {
  thunkCreateChannel,
  thunkHideNewChannelModal,
  thunkHideSearchSuggestions,
  thunkRemoveSuggestedUser,
  thunkUpdateChannelName,
  thunkUpdateCreateButtonStatus,
} from "../../utils/thunk-middlewares";
import { SearchboxAndCardContainer } from "../SearchBoxAndCardContainer/SearchBoxAndCardContainer";

import "./NewChannelModal.css";

export const _NewChannelModal = ({
  modal,
  channelName,
  selectedUsers,
  status,
  buttonDisabled,
  createChannelStatusMessage,
  hideNewChannelModal,
  hideSearchSuggestions,
  removeUserFromCandidateList,
  updateCreateButtonStatus,
  updateChannelName,
  createChannel,
}: Props) => {
  const id = "channel-modal-background";
  // const channelNameObject = useRef<HTMLInputElement>(null);

  const handleClickBackgrond = (e: MouseEvent) => {
    const element = e.target as HTMLElement;
    // if element other than searchbox and card list is clicked,
    // and the card is not hidden, then hide card list
    if (
      !(
        element.className === "channel-modal-searchbox" ||
        element.className === "candidate-card-container"
      ) &&
      !(
        status.type === "hidden" ||
        status.type === "notInitiated" ||
        status.type === "searchDone"
      )
    ) {
      hideSearchSuggestions();
    }
    if (element.id && element.id === id) {
      // now we are sure user clicked background
      // hide channel modal
      hideNewChannelModal();
    }
  };

  const handleChannelNameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    updateChannelName(e.target.value);
    updateCreateButtonStatus(e.target.value, selectedUsers, buttonDisabled);
  };

  const handleClickCreateButton = (e: MouseEvent) => {
    createChannel(channelName, selectedUsers);
  };

  return (
    <>
      <div
        id={id}
        className="channel-modal-background"
        onClick={handleClickBackgrond}
        style={{ display: modal ? "flex" : "none" }}
      >
        <div id="channel-modal-content" className="channel-modal-content">
          <span className="modal-top-title">Create A New Channel</span>
          <span className="modal-form-field-title">
            Start typing a name to add to your channel
          </span>
          <div className="channel-modal-form">
            <div className="modal-form-input">
              <div className="channel-modal-name-container">
                <span className="channel-modal-form-span">Channel Name</span>
                <input
                  type="text"
                  name="channelName"
                  id="channelName"
                  value={channelName}
                  // ref={channelNameObject}
                  onChange={handleChannelNameChange}
                />
              </div>
              <SearchboxAndCardContainer />
              <div className="member-candidate-list">
                {selectedUsers.map((user) => (
                  <SuggestedUser
                    key={user.id}
                    id={user.id}
                    displayName={user.displayName}
                    onClick={() => removeUserFromCandidateList(user.id)}
                  />
                ))}
              </div>
            </div>
            <div className="channel-button-container">
              <button
                id="submit"
                className="channel-button"
                onClick={handleClickCreateButton}
                disabled={buttonDisabled ? true : false}
              >
                CREATE CHANNEL
              </button>
              <span className="status-message">
                {createChannelStatusMessage}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  modal: state.newChannel.modal,
  channelName: state.newChannel.channelName,
  selectedUsers: state.newChannel.selectedUsers,
  status: state.newChannel.searchStatus,
  buttonDisabled: state.newChannel.buttonDisabled,
  createChannelStatusMessage: state.newChannel.createChannelStatusMessage,
});
const mapDispatchToProps = {
  hideNewChannelModal: thunkHideNewChannelModal,
  hideSearchSuggestions: thunkHideSearchSuggestions,
  removeUserFromCandidateList: thunkRemoveSuggestedUser,
  updateCreateButtonStatus: thunkUpdateCreateButtonStatus,
  createChannel: thunkCreateChannel,
  updateChannelName: thunkUpdateChannelName,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const NewChannelModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(_NewChannelModal);
