import { getFakeState } from "../../utils/testHelpers";

// mock custom dispatch hook
export const useAppDispatch = () => null;
// mock custom selector hook
export const useAppSelector = (params: any) => getFakeState();
