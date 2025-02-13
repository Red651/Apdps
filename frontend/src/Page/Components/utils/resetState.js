import { useJobContext } from "../../../Context/JobContext";
import { RESET_STATE } from "../../../Reducer/reducer";

export const resetState = () => {
  const { dispatch } = useJobContext();
  dispatch({ type: RESET_STATE });
};
