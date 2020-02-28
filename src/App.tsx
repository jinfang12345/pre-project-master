import React from 'react';
import * as H from 'history';
import { Router, Route, Switch } from 'react-router-dom';
import { withPage, withBreadcrumb } from './Container';
import { Paths, Links } from 'Breadcrumb';
import Default from './Pages/Default';
import { ConfigProvider, LocaleProvider } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import InfoPage from 'InfoPage';
import { ApiConfig, ErrorResponse } from '@maxtropy/kingfisher-api';
import Navigation from './Navigation';
import AuthProvider from './Context/Auth';
import PrivateRoute from './PrivateRoute';

const Project = React.lazy(() => import('./Pages/Project'));
const MeasurementList = React.lazy(() => import('./Pages/MesaurementList'));
const CircuitList = React.lazy(() => import('./Pages/CircuitList'));
const LossList = React.lazy(() => import('./Pages/LossList'));
const LossAdd = React.lazy(() => import('./Pages/LossAdd'));
const LossDetail = React.lazy(() => import('./Pages/LossDetail'));
// const LossEdit = React.lazy(() => import('./Pages/LossEdit'));
const UniverseList = React.lazy(() => import('./Pages/UniverseList'));
const MeasurementAdd = React.lazy(() => import('./Pages/Measurement/Add'));
const MeasurementEdit = React.lazy(() => import('./Pages/Measurement/Edit'));
const MeasurementDetail = React.lazy(() => import('./Pages/Measurement/Detail'));
const CircuitAdd = React.lazy(() => import('./Pages/CircuitAdd'));
const CircuitDetail = React.lazy(() => import('./Pages/CircuitDetail'));
// const CircuitEdit = React.lazy(() => import('./Pages/CircuitEdit'));
const UniverseAdd = React.lazy(() => import('./Pages/UniverseAdd'));
const UniverseDetail = React.lazy(() => import('./Pages/UniverseDetail'));
// const UniverseEdit = React.lazy(() => import('./Pages/UniverseEdit'));

const history = H.createBrowserHistory({
  basename: process.env.PUBLIC_URL || undefined,
});

const ErrorHandler = {
  401: () => history.push(Links[403]),
  403: () => history.push(Links[403]),
};

const setApiErrorHandler = () => {
  ApiConfig.apiErrorHandler = (e: ErrorResponse, httpStatus: number) => {
    if (Reflect.has(ErrorHandler, httpStatus)) {
      ErrorHandler[httpStatus]();
      return true;
    }
    return false;
  };
};
setApiErrorHandler();

const App: React.FunctionComponent = (): React.ReactElement => {
  return (
    <AuthProvider>
      <LocaleProvider locale={zhCN}>
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Router history={history}>
            <Navigation />
            <Switch>
              <Route exact path="/" component={Default} />
              <PrivateRoute exact path={Paths.Project} render={withPage(Project)} />
              <PrivateRoute exact path={Paths.MeasurementList} render={withPage(MeasurementList)} />
              <PrivateRoute exact path={Paths.CircuitList} render={withBreadcrumb(CircuitList)} />
              <PrivateRoute exact path={Paths.LossList} render={withPage(LossList)} />
              <PrivateRoute exact path={Paths.LossAdd} render={withPage(LossAdd)} />
              <PrivateRoute exact path={Paths.LossDetail} render={withPage(LossDetail)} />
              <PrivateRoute exact path={Paths.LossEdit} render={withPage(LossAdd)} />
              <PrivateRoute exact path={Paths.UniverseList} render={withBreadcrumb(UniverseList)} />
              <PrivateRoute exact path={Paths.MeasurementAdd} render={withPage(MeasurementAdd)} />
              <PrivateRoute exact path={Paths.MeasurementEdit} render={withPage(MeasurementEdit)} />
              <PrivateRoute exact path={Paths.MeasurementDetail} render={withPage(MeasurementDetail)} />
              <PrivateRoute exact path={Paths.CircuitAdd} render={withPage(CircuitAdd)} />
              <PrivateRoute exact path={Paths.CircuitEdit} render={withPage(CircuitAdd)} />
              <PrivateRoute exact path={Paths.UniverseAdd} render={withPage(UniverseAdd)} />
              <PrivateRoute exact path={Paths.UniverseDetail} render={withPage(UniverseDetail)} />
              <PrivateRoute exact path={Paths.UniverseEdit} render={withPage(UniverseAdd)} />
              <PrivateRoute exact path={Paths.CircuitDetail} render={withPage(CircuitDetail)} />
              <Route exact path={Paths[403]} render={InfoPage[403]} />
              <Route exact path={Paths[500]} render={InfoPage[500]} />
              <Route exact path={Paths.empty} render={InfoPage.empty} />
              <Route exact path={Paths.syncError} render={InfoPage.syncError} />
              <Route render={InfoPage[404]} />
            </Switch>
          </Router>
        </ConfigProvider>
      </LocaleProvider>
    </AuthProvider>
  );
};

export default App;
