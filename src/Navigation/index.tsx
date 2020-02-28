import React from 'react';
import logo from './logo.png';
import './index.less';

const Navigation: React.FC = () => {
  return (
    <div className="c-navigation">
      <img className="logo" src={logo} />
      <div className="title">数据中台配置工具</div>
    </div>
  );
};

export default Navigation;
