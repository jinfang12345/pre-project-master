import React from 'react';
import { Spin } from 'antd';
import './index.less';

const Loading: React.FunctionComponent = () => {
  return (
    <div className="c-info-page loading">
      <Spin />
    </div>
  );
};

export default Loading;
