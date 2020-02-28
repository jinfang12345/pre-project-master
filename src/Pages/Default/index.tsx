import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { Links } from 'Breadcrumb';
import { useFetchData } from 'lib/hooks';
import { aliIotAppInfo, getAuthorize, UserType, aliIotSynchronize } from '@maxtropy/kingfisher-api';
import InfoPage from 'InfoPage';
import { AuthContext, ActionTypes, Action } from 'Context/Auth';

interface InitResult {
  redirect: string;
}

const sync = (dispatch: React.Dispatch<Action>) => async (
  projectId: number,
  defaultPath?: string,
): Promise<InitResult> => {
  // TODO 这里需要保证defaultPath里的projectId和appInfo返回的projectId一致，目前这样的简单处理存在风险
  const successRedirect = defaultPath && defaultPath.includes('' + projectId) ? defaultPath : Links.Project(projectId);
  try {
    await aliIotSynchronize(projectId);
    dispatch({
      type: ActionTypes.SYNC,
      payload: { syncStatus: true },
    });
    return {
      redirect: successRedirect,
    };
  } catch (err) {
    dispatch({
      type: ActionTypes.SYNC,
      payload: { syncStatus: false },
    });
    return {
      redirect: Links.syncError,
    };
  }
};

const init = (dispatch: React.Dispatch<Action>, defaultPath?: string) => async (): Promise<InitResult> => {
  try {
    const auth = await getAuthorize();
    if (auth.authority !== UserType.SYSTEM_ADMIN && auth.authority !== UserType.DATA_ADMIN) {
      throw new Error("current user's auth is not enough");
    }
    dispatch({
      type: ActionTypes.AUTH,
      payload: { auth },
    });
  } catch (err) {
    console.error('auth error', err);
    dispatch({
      type: ActionTypes.AUTH,
      payload: { auth: undefined },
    });
    return {
      redirect: Links[403],
    };
  }
  try {
    const appInfo = await aliIotAppInfo();
    if (!appInfo.projectId) {
      throw new Error('current app info has no projectId');
    } else {
      dispatch({
        type: ActionTypes.APP_INFO,
        payload: { appInfo },
      });
      const result = await sync(dispatch)(appInfo.projectId, defaultPath);
      return result;
    }
  } catch (err) {
    console.error('app info error', err);
    dispatch({
      type: ActionTypes.APP_INFO,
      payload: { appInfo: undefined },
    });
    return {
      redirect: Links.empty,
    };
  }
};

const Default: React.FC<RouteComponentProps<{}, {}, { from?: string }>> = props => {
  const { store, dispatch } = React.useContext(AuthContext);
  const { location } = props;
  const defaultPath = location.state ? location.state.from : undefined;
  const { value, loading } = useFetchData<InitResult>(init(dispatch, defaultPath));
  if (store.auth && store.appInfo) {
    // 进入了同步阶段
    return (
      <InfoPage.progress loading={loading} result={loading ? 'normal' : store.syncStatus ? 'success' : 'exception'}>
        <Redirect to={value && value.redirect ? value.redirect : Links.empty} />
      </InfoPage.progress>
    );
  } else if (loading) {
    // 进入了auth或者appInfo loading状态
    return <InfoPage.loading />;
  } else {
    // 进入了auth或者appInfo 报错的状态
    return <Redirect to={value && value.redirect ? value.redirect : Links.empty} />;
  }
};

export default Default;
