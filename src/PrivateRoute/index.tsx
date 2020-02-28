import React from 'react';
import { RouteProps, Route, Redirect } from 'react-router-dom';
import { AuthContext } from 'Context/Auth';

const PrivateRoute: React.FC<RouteProps> = props => {
  const { store } = React.useContext(AuthContext);
  if (!store.syncStatus) {
    return (
      <Redirect
        to={{
          pathname: '/',
          state: {
            from: props.location ? props.location.pathname : undefined,
          },
        }}
      />
    );
  } else {
    return <Route {...props} />;
  }
};

export default PrivateRoute;
