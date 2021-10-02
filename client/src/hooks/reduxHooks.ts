import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../utils/store";

/**
 * custom useDispatch hook and use Selector hook
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export type AppDispatchType = ReturnType<typeof useAppDispatch>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
