import { MouseEventHandler } from "react";
import { connect, ConnectedProps } from "react-redux";

import {
  thunkChangeFormContent,
  thunkUpdateMemberModal,
} from "../../../utils/thunk-middlewares";
import { RootState } from "../../../utils/store";
import { ChatTextarea } from "../../Chat/ChatTextarea/ChatTextarea";
import { PaperPlaneIcon } from "../../Chat/PaperPlaneIcon/PaperPlaneIcon";
import { ChatPane } from "../../Chat/ChatPane/ChatPane";
import { Button } from "../../Common/Button/Button";

import { useSendMessage } from "../../../hooks/messageHooks";
import { useAppSelector } from "../../../hooks/reduxHooks";

import "./RightColumn.css";

const RColumn = ({ changeFormContent, updateMemberModal }: Props) => {
  const send = useSendMessage();
  const {
    user: { userInfo },
    channel: { highlighted, channels },
    message: { content },
  } = useAppSelector((state) => state);

  const highlightedChannel = channels.filter((ch) => ch.id === highlighted)[0];
  const handleChange = (data: string) => {
    // This avoids a new line without any words
    if (data !== "\n") changeFormContent(data);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if Enter + Shift key are pressed, then add a new line.
    // if Enter + any other keys are pressed, then send a message
    if (e.key === "Enter" && !e.shiftKey && content.length > 0) {
      send(content);
      return;
    }
  };

  const handleClickAddMemberButton: MouseEventHandler = (e) => {
    updateMemberModal();
  };

  return (
    <div className="right-column">
      <div className="channel-title-container">
        <div
          style={{ width: "100%", display: "flex", flexDirection: "column" }}
        >
          <span className="channel-title">
            {highlightedChannel ? highlightedChannel.name : ""}
          </span>
          <span>Last Update - 2 days ago</span>
        </div>
        <div className="add-member-button-container">
          {!!highlighted ? (
            <Button enabled={true} onClick={handleClickAddMemberButton}>
              + ADD
            </Button>
          ) : null}
        </div>
      </div>
      {highlightedChannel && userInfo && userInfo.userId ? (
        <ChatPane channel={highlightedChannel} senderId={userInfo.userId} />
      ) : (
        ""
      )}
      <div className="chat-form-container">
        <div className="chat-form-container__header">
          Press Enter to send message
        </div>
        <ChatTextarea
          content={content}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
        <div className="chat-form-button-container">
          <PaperPlaneIcon onClick={() => send(content)} />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {
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
