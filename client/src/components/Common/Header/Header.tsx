import { useAppSelector } from "../../../hooks/reduxHooks";
import { useToggleUserModal } from "../../../hooks/userHooks";

import "./Header.css";

export const Header = () => {
  const { userInfo } = useAppSelector((state) => state.user);
  const toggle = useToggleUserModal();

  const { profilePhotoURL, displayName } = userInfo
    ? userInfo
    : { profilePhotoURL: "", displayName: "" };
  return (
    <div className="header">
      <div className="header__companyProfile">
        <span>Chat App</span>
      </div>
      <div className="header__profileContainer">
        <img
          className="header__profileImage"
          src={profilePhotoURL}
          alt="profile picture"
        />
        <span className="header__displayName">{displayName}</span>
        <i
          className="fa fa-angle-down"
          onClick={() => toggle({ enable: true })}
        ></i>
      </div>
    </div>
  );
};
