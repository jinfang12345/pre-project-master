import React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Links } from 'Breadcrumb';
import { Icon, Tooltip } from 'antd';
import { aliIotGetOverview, AliIotServiceCapability, AliIotOverview } from '@maxtropy/kingfisher-api';
import InfoPage from 'InfoPage';
import { useFetchData } from 'lib/hooks';
import { ElectricAblities, OtherAbilities, AbilityGroup } from './config';
import Preview, { hasAbility } from 'Components/Preview';
import './index.less';

const hasGroupAbility = (group: AbilityGroup, abilityList?: AliIotServiceCapability[]): boolean =>
  Array.isArray(abilityList) && group.children.some(a => abilityList.map(i => i.order).includes(a.order));

export type ProjectRouteProps = RouteComponentProps<{ projectId: string }>;

const Project: React.FunctionComponent<ProjectRouteProps> = (props): React.ReactElement => {
  const projectId = props.match.params.projectId;
  const { value, loading } = useFetchData(() => aliIotGetOverview(+projectId));
  const project = (value || {}) as AliIotOverview;
  return loading ? (
    <InfoPage.loading />
  ) : (
    <div className="page-project">
      <div className="title">
        <span className="text">电力</span>
        <span className="text">非电力</span>
      </div>
      <div className="block-container">
        <div className="block-wrapper">
          <div className="block">
            <div className="content">
              <span className="text">计费进线</span>
              <span className="count">{project.measurementCount || 0}</span>
            </div>
            <div className="footer">
              <Link to={Links.MeasurementList(projectId)}>查看详情</Link>
            </div>
          </div>
          <div className="block">
            <div className="content">
              <span className="text">回路</span>
              <span className="count">{project.circuitCount || 0}</span>
            </div>
            <div className="footer">
              <Link to={Links.CircuitList(projectId)}>查看详情</Link>
            </div>
          </div>
          <div className="block">
            <div className="content">
              <span className="text">损耗对象</span>
              <span className="count">{project.lossCount || 0}</span>
            </div>
            <div className="footer">
              <Link to={Links.LossList(projectId)}>查看详情</Link>
            </div>
          </div>
        </div>
        <div className="block-wrapper lg">
          <div className="block">
            <div className="content">
              <span className="text">监测点</span>
              <span className="count">{project.universalCircuitCount || 0}</span>
            </div>
            <div className="footer">
              <Link to={Links.UniverseList(projectId)}>查看详情</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="service-wrapper">
        <div className="service">
          <div className="header">
            可使用服务模型
            <Tooltip
              getPopupContainer={() => document.querySelector('.page-project') as HTMLElement}
              title={
                <div>
                  <div>• 配置回路数非零可使用以下服务模型：接线图。</div>
                  <div>
                    • 配置绑定设备的回路数非零可使用以下服务模型：数据统计、数据统计、安全评估、需量管理、AI分析报告。
                  </div>
                  <div>• 配置计费进线为分时电度电价，且绑定设备的回路数非零，可使用以下服务模型：能效评估。</div>
                </div>
              }
              placement="bottomRight"
              overlayClassName="electric-tooltip"
            >
              <Icon type="info-circle" style={{ marginLeft: 6 }} />
            </Tooltip>
          </div>
          <div className="content">
            {ElectricAblities.map(i => (
              <div
                key={i.name}
                className={`ability ${hasGroupAbility(i, project.electricCapabilityList) ? '' : 'not-have'}`}
              >
                <span className="name">{i.name}</span>
                <div className="children">
                  {(i.children || []).map(j => (
                    <Preview key={j.name} ability={j} placement="bottomRight">
                      <span className={`child ${hasAbility(j, project.electricCapabilityList) ? '' : 'not-have'}`}>
                        {j.description}
                      </span>
                    </Preview>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="service">
          <div className="header">
            可使用服务模型
            <Tooltip
              getPopupContainer={() => document.querySelector('.page-project') as HTMLElement}
              title="配置绑定设备的监测点数非零可使用以下服务模型：数据统计、数据统计"
              overlayClassName="other-tooltip"
            >
              <Icon type="info-circle" style={{ marginLeft: 6 }} />
            </Tooltip>
          </div>
          <div className="content">
            {OtherAbilities.map(i => (
              <div
                key={i.name}
                className={`ability ${hasGroupAbility(i, project.nonElectricCapabilityList) ? '' : 'not-have'}`}
              >
                <span className="name">{i.name}</span>
                <div className="children">
                  {(i.children || []).map(j => (
                    <Preview key={j.name} ability={j} placement="bottomRight">
                      <span className={`child ${hasAbility(j, project.nonElectricCapabilityList) ? '' : 'not-have'}`}>
                        {j.description}
                      </span>
                    </Preview>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
