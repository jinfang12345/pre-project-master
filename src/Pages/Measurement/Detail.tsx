import React from 'react';
import EnhancedForm from '@maxtropy/form';
import { getMeasurement, MeasurementForm } from '@maxtropy/kingfisher-api';
import { MeasurementProps } from './Add';
import Form from './Form';
import InfoPage from 'InfoPage';
import { useFetchData } from 'lib/hooks';
import './index.less';

const MeasurementDetail: React.FunctionComponent<MeasurementProps> = (props): React.ReactElement => {
  const { projectId, measurementId } = props.match.params;
  const { loading, value } = useFetchData(() => getMeasurement(measurementId as string));
  const measurement = (value || {}) as MeasurementForm;
  return loading ? (
    <InfoPage.loading />
  ) : (
    <div className="page-measurement">
      <EnhancedForm
        defaultValue={measurement}
        editing={false}
        render={renderProps => (
          <Form history={props.history} projectId={projectId} measurementId={measurementId} {...renderProps} />
        )}
      />
    </div>
  );
};

export default MeasurementDetail;
