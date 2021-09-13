import { MouseEvent } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../../utils/store";
import { thunkAddSuggestedUser } from "../../../utils/thunk-middlewares";

import "./CandidateCardList.css";

export const _CandidateCardList = ({ status, addSuggestedUser }: Props) => {
  const component = () => {
    switch (status.type) {
      case "notInitiated":
      case "hidden":
      case "searchDone":
        return null;

      case "searching":
        return <CandidateCard name="searching..." />;

      case "userFound":
        return status.users.map((user) => (
          <CandidateCard
            key={user.id}
            name={`${user.displayName} (${user.username})`}
            onClick={() => addSuggestedUser(user)}
          />
        ));

      case "noUserFound":
        return <CandidateCard name="We didn't find any matches." />;
    }
  };

  return <ul className="candidate-card-list">{component()}</ul>;
};

const CandidateCard = ({
  name,
  onClick,
}: {
  name: string;
  onClick?: () => void;
}) => {
  const handleClick = (e: MouseEvent) => {
    if (onClick) onClick();
  };

  return (
    <span className="candidate-card-container" onClick={handleClick}>
      {name}
    </span>
  );
};

const mapStateToProps = (state: RootState) => ({
  status: state.newChannel.searchStatus,
});

const mapDispatchToProps = {
  addSuggestedUser: thunkAddSuggestedUser,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const CandidateCardList = connector(_CandidateCardList);
