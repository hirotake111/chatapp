import "./Header.css";

export const Header = ({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) => {
  return (
    <div className="header">
      Chat App ({username} - {userId})
    </div>
  );
};
