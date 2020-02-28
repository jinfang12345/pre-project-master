import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Breadcrumb from 'Breadcrumb';
import InfoPage from 'InfoPage';
import './index.less';

const BreadcrumbContainer: React.FunctionComponent<RouteComponentProps> = (props): React.ReactElement => {
  return (
    <div className="global-container">
      <Breadcrumb {...props} />
      {props.children}
    </div>
  );
};

const PageContainer: React.FunctionComponent<RouteComponentProps> = (props): React.ReactElement => {
  return (
    <BreadcrumbContainer {...props}>
      <div className="page">{props.children}</div>
    </BreadcrumbContainer>
  );
};

const withBreadcrumb = <T extends RouteComponentProps>(
  Component: React.ComponentType<T>,
): React.FunctionComponent<T> => props => (
  <BreadcrumbContainer {...props}>
    <React.Suspense fallback={<InfoPage.loading />}>
      <Component {...props} />
    </React.Suspense>
  </BreadcrumbContainer>
);

const withPage = <T extends RouteComponentProps>(
  Component: React.ComponentType<T>,
): React.FunctionComponent<T> => props => (
  <PageContainer {...props}>
    <React.Suspense fallback={<InfoPage.loading />}>
      <Component {...props} />
    </React.Suspense>
  </PageContainer>
);

export { withPage, withBreadcrumb };
