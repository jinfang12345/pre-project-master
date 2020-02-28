import React from 'react';
import Loading from './Loading';
import Progress from './Progress';
import { ProjectRouteProps } from '../Pages/Project';
import Base, { InfoPageConfig } from './Base';

const create = (config: InfoPageConfig) => (props: ProjectRouteProps) => {
  const definedProps = Object.assign({}, config, props);
  return <Base {...definedProps} />;
};

export default {
  loading: Loading,
  progress: Progress,
  403: create({
    title: '抱歉，您暂无权限',
    content: '请返回首页查看',
    type: '403',
    hasRedirect: true,
  }),
  404: create({
    title: '抱歉，您访问的页面不存在',
    type: '404',
    hasRedirect: false,
  }),
  500: create({
    title: '抱歉，服务器出错了',
    content: '请重新刷新页面或返回首页',
    type: '500',
    hasRedirect: true,
  }),
  empty: create({
    title: '无内容',
    content: '请返回首页查看',
    type: 'empty',
    hasRedirect: true,
  }),
  syncError: create({
    title: '请关闭本页面再重新打开',
    content: '抱歉，后台数据获取失败',
    type: 'syncError',
    hasRedirect: false,
  }),
};
