import { useAppSelector } from "../../../hooks/reduxHooks";
import { useToggleUserModal } from "../../../hooks/userHooks";

import "./Header.css";

export const Header = () => {
  const { userInfo } = useAppSelector((state) => state.user);
  const toggle = useToggleUserModal();

  return (
    <div className="header">
      <div className="header__companyProfile">
        <span>Chat App</span>
      </div>
      <div
        className="header__profileContainer"
        onClick={() => toggle({ enable: true })}
      >
        <img
          className="header__profileImage"
          src={userInfo?.profilePhotoURL}
          alt="profile"
        />
        <span className="header__displayName">{userInfo?.displayName}</span>
        <i className="fa fa-angle-down"></i>
      </div>
    </div>
  );
};
