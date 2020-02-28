import React, { ReactNode } from 'react';
import { Button } from 'antd';
import infoIcn from './info.svg';
import { RouteComponentProps } from 'react-router-dom';
import './index.less';

export interface InfoPageConfig {
  title?: string | ReactNode;
  content?: string | ReactNode;
  hasRedirect: boolean; // 不是很优雅，应该允许配置redirect，不过暂时没那么复杂的需求，以后有需求再改
  type: '403' | '404' | '500' | 'empty' | 'syncError'; // 500暂时没用到
}

export type InfoPageProps = InfoPageConfig & RouteComponentProps;

const Base: React.FunctionComponent<InfoPageProps> = props => {
  const { type, title, hasRedirect, content, history } = props;
  const redirect = () => history.replace('/');
  return (
    <div className={`c-info-page type-${type}`}>
      <img src={infoIcn} />
      <div className="title">{title}</div>
      {content && <div className="content">{content}</div>}
      {hasRedirect && (
        <Button type="primary" onClick={redirect}>
          返回首页
        </Button>
      )}
    </div>
  );
};

export default Base;
