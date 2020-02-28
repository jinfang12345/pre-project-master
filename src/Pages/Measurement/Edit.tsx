import React from 'react';
import { getMeasurement, MeasurementForm } from '@maxtropy/kingfisher-api';
import EnhancedForm from '@maxtropy/form';
import Form from './Form';
import { MeasurementProps } from './Add';
import { useFetchData } from 'lib/hooks';
import InfoPage from 'InfoPage';
import './index.less';

const MeasurementEdit: React.FunctionComponent<MeasurementProps> = (props): React.ReactElement => {
  const { measurementId, projectId } = props.match.params;
  const { loading, value } = useFetchData(() => getMeasurement(measurementId as string));
  const measurement = (value || {}) as MeasurementForm;
  return loading ? (
    <InfoPage.loading />
  ) : (
    <div className="page-measurement">
      <EnhancedForm
        defaultValue={{ ...measurement }}
        editing
        render={renderProps => (
          <Form history={props.history} projectId={projectId} measurementId={measurementId} {...renderProps} />
        )}
      />
    </div>
  );
};

export default MeasurementEdit;
