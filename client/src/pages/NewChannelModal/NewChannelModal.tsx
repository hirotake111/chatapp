import { MouseEvent } from "react";

import { SuggestedUser } from "../../components/Search/SuggestedUser/SuggestedUser";
import { SearchboxAndCardContainer } from "../SearchboxAndCardContainer/SearchboxAndCardContainer";

import "./NewChannelModal.css";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import {
  RemoveSuggestedUserAction,
  updateNewChannelModalAction,
  UpdateSearchStatusAction,
} from "../../actions/newChannelActions";

import {
  useCreateChannel,
  useUpdateCreateButtonStatus,
} from "../../hooks/newChannelHooks";

export const NewChannelModal = () => {
  const {
    modal,
    selectedUsers,
    searchStatus,
    buttonDisabled,
    createChannelStatusMessage,
  } = useAppSelector((state) => state.newChannel);
  const dispatch = useAppDispatch();
  const [channelName, update] = useUpdateCreateButtonStatus();
  const createChannel = useCreateChannel();

  const handleClickBackgrond = (e: MouseEvent) => {
    const element = e.target as HTMLElement;
    if (element.id && element.id === "channel-modal-background") {
      // hide channel modal
      dispatch(updateNewChannelModalAction(false));
    }
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
  };

  return (
    <>
      <div
        id="channel-modal-background"
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
                  onChange={(e) => update(e.target.value)}
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
                onClick={createChannel}
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
