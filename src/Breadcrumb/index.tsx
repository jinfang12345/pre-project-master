import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Breadcrumb, Icon } from 'antd';
import { Words, WordsMap } from './const';
import './index.less';

interface BaseInfo {
  pathname: string;
  id?: string;
}

interface PathInfo extends BaseInfo {
  display: string;
  link: string;
}

const joinPath = (...args: string[]): string => Array.from(args).join('');
const joinWords = (...args: Words[]): string => '/' + Array.from(args).join('-');
const isId = (s: string): boolean => s.startsWith(':');
const getLinkFormInfo = (info: BaseInfo): string => `/${info.pathname}${info.id ? `/${info.id}` : ''}`;
const getLinkFromPrev = (current: BaseInfo, prev?: PathInfo): string =>
  (prev ? prev.link : '') + getLinkFormInfo(current);

const translate = (path: string, url: string): PathInfo[] => {
  const urlArray = url.split('/').filter(i => i !== '');
  const pathArray: BaseInfo[] = path
    .split('/')
    .filter(i => i !== '')
    .reduce(
      (prev, pathname, index) => {
        if (isId(pathname)) {
          const last = prev.pop();
          if (last) {
            prev.push(
              Object.assign(last, {
                id: urlArray[index],
              }),
            );
          }
        } else {
          prev.push({ pathname });
        }
        return prev;
      },
      [] as BaseInfo[],
    );
  const result: PathInfo[] = [];
  for (let i = 0; i < pathArray.length; i++) {
    const info = pathArray[i];
    const prev = result[i - 1];
    result.push(
      Object.assign(info, {
        display: info.pathname
          .split('-')
          .map(s => WordsMap.get(s as Words))
          .join(''),
        link: getLinkFromPrev(info, prev),
      }),
    );
  }
  return result;
};

const CustomBreadcrumb: React.FunctionComponent<RouteComponentProps> = props => {
  const result = translate(props.match.path, props.match.url);
  return (
    <div className={`global-breadcrumb ${result.length > 1 ? 'lg' : 'sm'}`}>
      {result.length > 1 && (
        <Breadcrumb separator={<Icon type="right" />}>
          {result.map((i, index) => (
            <Breadcrumb.Item key={index}>
              {index === result.length - 1 ? (
                i.display
              ) : (
                <Link className="link" to={i.link}>
                  {i.display}
                </Link>
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      {result.length >= 1 && <div className="title">{result[result.length - 1].display}</div>}
    </div>
  );
};

const toPageWithId = (replace: string | string[], path: string) => (id: string | number | (string | number)[]) => {
  if (!Array.isArray(replace)) {
    replace = [replace];
  }
  if (!Array.isArray(id)) {
    id = [id];
  }
  if (id.length !== replace.length) {
    throw new Error('id和要被替换的:xxxId数量不一致');
  }
  return replace.reduce((prev, key, index) => prev.replace(key, `/${id[index]}`), path);
};

const Project = joinPath(joinWords(Words.project, Words.config), Words.projectId);
const MeasurementList = joinPath(Project, joinWords(Words.measurement, Words.list));
const CircuitList = joinPath(Project, joinWords(Words.circuit, Words.list));
const LossList = joinPath(Project, joinWords(Words.loss, Words.list));
const UniverseList = joinPath(Project, joinWords(Words.universe, Words.list));

export const Paths = {
  Project,
  MeasurementList,
  MeasurementAdd: joinPath(MeasurementList, joinWords(Words.add, Words.measurement)),
  MeasurementEdit: joinPath(MeasurementList, joinWords(Words.edit, Words.measurement), Words.measurementId),
  MeasurementDetail: joinPath(MeasurementList, joinWords(Words.measurement, Words.detail), Words.measurementId),
  CircuitList,
  CircuitAdd: joinPath(CircuitList, joinWords(Words.add, Words.circuit), Words.siteId),
  CircuitEdit: joinPath(CircuitList, joinWords(Words.circuit, Words.edit), Words.siteId, Words.circuitId),
  CircuitDetail: joinPath(CircuitList, joinWords(Words.circuit, Words.detail), Words.siteId, Words.circuitId),
  LossList,
  LossAdd: joinPath(LossList, joinWords(Words.add, Words.loss)),
  LossDetail: joinPath(LossList, joinWords(Words.loss, Words.detail), Words.lossId),
  LossEdit: joinPath(LossList, joinWords(Words.loss, Words.edit), Words.lossId),
  UniverseList,
  UniverseAdd: joinPath(UniverseList, joinWords(Words.add, Words.universe), Words.siteId),
  UniverseEdit: joinPath(UniverseList, joinWords(Words.universe, Words.edit), Words.siteId, Words.universeId),
  UniverseDetail: joinPath(UniverseList, joinWords(Words.universe, Words.detail), Words.siteId, Words.universeId),
  403: '/403',
  500: '/500',
  empty: '/empty',
  syncError: '/syncError',
};

export const Links = {
  Project: toPageWithId(Words.projectId, Paths.Project),
  MeasurementList: toPageWithId(Words.projectId, Paths.MeasurementList),
  CircuitList: toPageWithId(Words.projectId, Paths.CircuitList),
  UniverseList: toPageWithId(Words.projectId, Paths.UniverseList),
  MeasurementAdd: toPageWithId(Words.projectId, Paths.MeasurementAdd),
  MeasurementEdit: toPageWithId([Words.projectId, Words.measurementId], Paths.MeasurementEdit),
  MeasurementDetail: toPageWithId([Words.projectId, Words.measurementId], Paths.MeasurementDetail),
  CircuitAdd: toPageWithId([Words.projectId, Words.siteId], Paths.CircuitAdd),
  CircuitDetail: toPageWithId([Words.projectId, Words.siteId, Words.circuitId], Paths.CircuitDetail),
  CircuitEdit: toPageWithId([Words.projectId, Words.siteId, Words.circuitId], Paths.CircuitEdit),
  UniverseAdd: toPageWithId([Words.projectId, Words.siteId], Paths.UniverseAdd),
  UniverseDetail: toPageWithId([Words.projectId, Words.siteId, Words.universeId], Paths.UniverseDetail),
  UniverseEdit: toPageWithId([Words.projectId, Words.siteId, Words.universeId], Paths.UniverseEdit),
  LossList: toPageWithId(Words.projectId, Paths.LossList),
  LossAdd: toPageWithId(Words.projectId, Paths.LossAdd),
  LossDetail: toPageWithId([Words.projectId, Words.lossId], Paths.LossDetail),
  LossEdit: toPageWithId([Words.projectId, Words.lossId], Paths.LossEdit),
  403: Paths[403],
  500: Paths[500],
  empty: Paths.empty,
  syncError: Paths.syncError,
};

export default CustomBreadcrumb;
