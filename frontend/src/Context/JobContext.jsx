import { useContext, createContext, useReducer } from "react";
import { initialData } from "../Reducer/initialData";
import { reducer } from "../Reducer/reducer";

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialData);
  return (
    <JobContext.Provider value={{ state, dispatch }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobContext = () => {
  return useContext(JobContext);
};
