import "./ChatTextarea.css";

export const ChatTextarea = ({
  content,
  onChange,
  onKeyPress,
}: {
  content: string;
  onChange: (data: string) => void;
  onKeyPress: (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    content: string
  ) => void;
}) => {
  return (
    <textarea
      className="chat-textarea"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={(e) => onKeyPress(e, content)}
    />
  );
};
