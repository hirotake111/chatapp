interface Props {
  id: string;
  onClick: (params: any) => void;
}

export const SuggestedUser = ({ id, onClick }: Props) => (
  <span id={id} onClick={onClick}>
    mock SuggestedUser
  </span>
);
