import "./ChannelSearchBar.css";

export const ChannelSearchBar = () => {
  return (
    <div className="channel-search-bar">
      <div className="channel-search-bar__container">
        <i className="fa fa-search fa-2x channel-search-bar__search-icon"></i>
        <input
          className="channel-search-bar__input"
          type="text"
          placeholder="Search..."
        />
      </div>
    </div>
  );
};
