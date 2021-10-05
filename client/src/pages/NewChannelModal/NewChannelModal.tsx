import { ChangeEventHandler, MouseEvent } from "react";
import { connect, ConnectedProps } from "react-redux";

import { RootState } from "../../utils/store";
import {
  thunkCreateChannel,
  thunkUpdateCreateButtonStatus,
} from "../../utils/thunk-middlewares";

import { SuggestedUser } from "../../components/Search/SuggestedUser/SuggestedUser";
import { SearchboxAndCardContainer } from "../SearchboxAndCardContainer/SearchboxAndCardContainer";

import "./NewChannelModal.css";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import {
  RemoveSuggestedUserAction,
  UpdateChannelNameAction,
  updateNewChannelModalAction,
  UpdateSearchStatusAction,
} from "../../actions/newChannelActions";

export const _NewChannelModal = ({
  updateCreateButtonStatus,
  createChannel,
}: Props) => {
  const id = "channel-modal-background";
  // const channelNameObject = useRef<HTMLInputElement>(null);
  const {
    modal,
    channelName,
    selectedUsers,
    searchStatus,
    buttonDisabled,
    createChannelStatusMessage,
  } = useAppSelector((state) => state.newChannel);
  const dispatch = useAppDispatch();

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
        searchStatus.type === "hidden" ||
        searchStatus.type === "notInitiated" ||
        searchStatus.type === "searchDone"
      )
    ) {
      dispatch(UpdateSearchStatusAction({ type: "hidden" }));
    }
    if (element.id && element.id === id) {
      // now we are sure user clicked background
      // hide channel modal
      dispatch(updateNewChannelModalAction(false));
      // hideNewChannelModal();
    }
  };

  const handleChannelNameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    dispatch(UpdateChannelNameAction(e.target.value));
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
                    onClick={() => dispatch(RemoveSuggestedUserAction(user.id))}
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

const mapStateToProps = (state: RootState) => ({});
const mapDispatchToProps = {
  updateCreateButtonStatus: thunkUpdateCreateButtonStatus,
  createChannel: thunkCreateChannel,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const NewChannelModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(_NewChannelModal);
