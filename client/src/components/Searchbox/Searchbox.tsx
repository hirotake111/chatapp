import { ChangeEventHandler, useRef } from "react";

import "./Searchbox.css";

type Props = {
  searchboxId: string;
  span: string;
  milliseconds?: number;
  onEmptyCallback?: () => void;
  onChangeCallback: (quey: string) => void;
};

export const Searchbox = ({
  searchboxId,
  span,
  milliseconds = 1000,
  onEmptyCallback,
  onChangeCallback,
}: Props) => {
  const searchbox = useRef<HTMLInputElement>(null);

  const handleSearchBoxChange: ChangeEventHandler = async (e) => {
    // if searchbox is empty, then do nothing
    if (!(searchbox.current && searchbox.current.value.length !== 0)) {
      // invoke onEmptyCallback if exists
      if (onEmptyCallback) onEmptyCallback();
      return;
    }
    // set current value
    const query = searchbox.current.value;
    setTimeout(() => {
      // after milliseconds passed, check current value
      // if same, invoke searchbox change callback
      if (query === searchbox.current?.value) onChangeCallback(query);
    }, milliseconds);
  };

  return (
    <div className="searchbox-container">
      <span className="searchbox-span">{span}</span>
      <input
        type="text"
        ref={searchbox}
        onChange={handleSearchBoxChange}
        className="searchbox"
        name="searchbox"
        id={searchboxId}
      />
    </div>
  );
};
