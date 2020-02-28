import React from 'react';
import { AliIotAppInfo, AuthorizeDetail } from '@maxtropy/kingfisher-api';

export enum ActionTypes {
  AUTH = 'AUTH',
  APP_INFO = 'APP_INFO',
  SYNC = 'SYNC',
}

export interface Action {
  type: ActionTypes;
  payload: Partial<AuthStore>;
}

interface AuthStore {
  auth?: AuthorizeDetail;
  appInfo?: AliIotAppInfo;
  syncStatus: boolean;
}

interface AuthContextType {
  store: AuthStore;
  dispatch: React.Dispatch<Action>;
}

const initialState: AuthStore = {
  syncStatus: false,
};

export const AuthContext = React.createContext<AuthContextType>({
  store: initialState,
  dispatch: () => {},
});

const reducer: React.Reducer<AuthStore, Action> = (state, action) => {
  switch (action.type) {
    case ActionTypes.AUTH:
      return Object.assign({}, state, {
        auth: action.payload.auth,
      });
    case ActionTypes.APP_INFO:
      return Object.assign({}, state, {
        appInfo: action.payload.appInfo,
      });
    case ActionTypes.SYNC:
      return Object.assign({}, state, {
        syncStatus: action.payload.syncStatus,
      });
    default:
      return state;
  }
};

const AuthProvider: React.FC = props => {
  const [store, dispatch] = React.useReducer(reducer, initialState);
  return <AuthContext.Provider value={{ store, dispatch }}>{props.children}</AuthContext.Provider>;
};

export default AuthProvider;
