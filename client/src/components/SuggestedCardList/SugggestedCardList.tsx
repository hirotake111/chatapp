import { SuggestedCard } from "../SuggestedCard/SuggestedCard";
import "./SugggestedCardList.css";

export const SuggestedCardList = ({
  status,
  onCardClick,
}: {
  status: UserSearchStatus;
  onCardClick: (user: SearchedUser) => void;
}) => {
  const component = () => {
    switch (status.type) {
      case "notInitiated":
      case "hidden":
      case "searchDone":
        return null;

      case "searching":
        return <SuggestedCard name="searching..." />;

      case "userFound":
        return status.users.map((user) => (
          <SuggestedCard
            key={user.id}
            name={`${user.displayName} (${user.username})`}
            onClick={() => onCardClick(user)}
          />
        ));

      case "noUserFound":
        return <SuggestedCard name="We didn't find any matches." />;
    }
  };

  return <ul className="candidate-card-list">{component()}</ul>;
};
