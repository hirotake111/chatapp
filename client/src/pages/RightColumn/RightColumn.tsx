import { connect, ConnectedProps } from "react-redux";

import {
  thunkChangeFormContent,
  thunkGetChannelMessages,
  thunkSendMessage,
  thunkUpdateMemberModal,
} from "../../utils/thunk-middlewares";
import { RootState } from "../../utils/store";
import { ChatTextarea } from "../../components/Chat/ChatTextarea/ChatTextarea";
// import { MessageContainerItem } from "../MessageContainer/MessageContainerItem";
import { PaperPlaneIcon } from "../../components/Chat/PaperPlaneIcon/PaperPlaneIcon";
import { ChatPane } from "../../components/Chat/ChatPane/ChatPane";
import { Button } from "../../components/Common/Button/Button";

import "./RightColumn.css";
import { MouseEventHandler } from "react";

const RColumn = ({
  highlighted,
  channels,
  sender,
  sendMessage,
  changeFormContent,
  updateMemberModal,
  content,
}: Props) => {
  const handleClickPaperPlane = (): void => {
    // check if user is authenticated
    if (!(sender && sender.userId && sender.username)) {
      console.log("prop sender is undefined - you are probably not signed in");
      return;
    }
    // if highlighted does not have any data, then do nothing
    if (!highlighted) {
      console.log("prop highlighted is undefined");
      return;
    }
    const message: MessageWithNoId = {
      channelId: highlighted,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sender: {
        id: sender.userId,
        username: sender.username,
        displayName: sender.displayName,
      },
    };
    sendMessage(message);
  };

  const handleChange = (data: string) => {
    // This avoids a new line without any words
    if (data !== "\n") changeFormContent(data);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if Enter + Shift key are pressed, then add a new line.
    // if Enter + any other keys are pressed, then send a message
    if (e.key === "Enter" && !e.shiftKey && content.length > 0) {
      handleClickPaperPlane();
      return;
    }
  };

  const handleClickAddMemberButton: MouseEventHandler = (e) => {
    updateMemberModal();
  };

  return (
    <div className="right-column">
      <div className="channel-title-container">
        <span className="channel-title">
          {highlighted
            ? channels.filter((ch) => ch.id === highlighted)[0].name
            : ""}
        </span>
        <div className="add-member-button-container">
          {!!highlighted ? (
            <Button
              value="ADD USERS"
              enabled={true}
              onClick={handleClickAddMemberButton}
            ></Button>
          ) : null}
        </div>
      </div>
      {highlighted && sender && sender.userId ? (
        <ChatPane
          highlighted={highlighted}
          channels={channels}
          senderId={sender.userId}
        />
      ) : (
        ""
      )}
      <div className="chat-form-container">
        <ChatTextarea
          content={content}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
        <div className="chat-form-button-container">
          <PaperPlaneIcon onClick={() => handleClickPaperPlane()} />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  highlighted: state.channel.highlighted,
  channels: state.channel.channels,
  sender: state.user.userInfo,
  content: state.message.content,
});

const mapDispatchToProps = {
  sendMessage: (props: MessageWithNoId) => thunkSendMessage(props),
  getChannelMessage: (channelId: string) => thunkGetChannelMessages(channelId),
  changeFormContent: (content: string) => thunkChangeFormContent(content),
  updateMemberModal: () => thunkUpdateMemberModal(true),
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const RightColumn = connect(
  mapStateToProps,
  mapDispatchToProps
)(RColumn);
