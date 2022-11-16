import { AppSessionVariables, getSessionVariable, removeSessionVariable, setSessionVariable } from '../utils/AppSession';

export const getAccessToken = () => {
  return getSessionVariable(AppSessionVariables.WCP_ACCESS_TOKEN);
};

export const removeAccessToken = () => {
  removeSessionVariable(AppSessionVariables.WCP_ACCESS_TOKEN);
};

export const setAccessToken = (token) => {
  setSessionVariable(AppSessionVariables.WCP_ACCESS_TOKEN, token);
};
