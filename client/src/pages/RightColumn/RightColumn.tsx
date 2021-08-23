import { connect, ConnectedProps } from "react-redux";

import {
  thunkChangeFormContent,
  thunkGetChannelMessages,
  thunkSendMessage,
  thunkUpdateMemberModal,
} from "../../thunk-middlewares";
import { RootState } from "../../store";
import { ChatTextarea } from "../../components/ChatTextarea/ChatTextarea";
// import { MessageContainerItem } from "../MessageContainer/MessageContainerItem";
import { PaperPlaneIcon } from "../../components/PaperPlaneIcon/PaperPlaneIcon";
import { ChatPane } from "../../components/ChatPane/ChatPane";
import { CustomButton } from "../../components/CustomButton/CustomButton";

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
    if (!(sender.userId && sender.username)) {
      console.log("prop sender is undefined - you are probably not signed in");
      return;
    }
    // if highlighted does not have any data, then do nothing
    if (!highlighted) {
      console.log("prop highlighted is undefined");
      return;
    }
    const message: MessageWithNoId = {
      channelId: highlighted.id,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sender: { id: sender.userId, username: sender.username },
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
          {highlighted ? highlighted.name : " "}
        </span>
        <div className="add-member-button-container">
          <CustomButton
            value="ADD USERS"
            onClick={handleClickAddMemberButton}
          ></CustomButton>
        </div>
      </div>
      {highlighted && sender.userId ? (
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
