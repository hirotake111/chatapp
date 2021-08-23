import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../store";
import { Modal } from "../Modal/Modal";

const Component = (props: Props) => {
  return <Modal enabled={props.enabled} />;
};

const mapStateToProps = (state: RootState) => ({
  enabled: state.member.modalEnabled,
});

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {};

export const MemberModal = connector(Component);
