import React from 'react';
import EnhancedForm from '@maxtropy/form';
import { RouteComponentProps } from 'react-router-dom';
import Form, { getDefaultValue } from './Form';
import './index.less';

export type MeasurementProps = RouteComponentProps<{
  projectId: string;
  measurementId?: string;
}>;

const MeasurementAdd: React.FunctionComponent<MeasurementProps> = (props): React.ReactElement => {
  const { projectId } = props.match.params;

  return (
    <div className="page-measurement">
      <EnhancedForm
        defaultValue={{ ...getDefaultValue() }}
        editing
        render={renderProps => <Form history={props.history} projectId={projectId} {...renderProps} />}
      />
    </div>
  );
};

export default MeasurementAdd;
