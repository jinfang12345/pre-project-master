import React from 'react';
import { Col, Icon, Row, Spin, Tag } from 'antd';
import { RouteComponentProps } from 'react-router-dom';
import { getLoss, Loss, LossType, LossTypeLabel, Monitor, MonitorPositionType } from '@maxtropy/kingfisher-api';
import { MAX_INT } from 'lib/const';
import { LossAbility } from '../LossAdd/config';
import { Links } from 'Breadcrumb';
import './index.less';
import FormAbilityPage from '../../Components/FormAbilityPage';
import AbilityList from '../../Components/AbilityList';

const MAX_TAG_SHOW_COUNT = 30;
export type LossDetailProps = RouteComponentProps<{
  projectId: string;
  lossId: string;
}>;
interface LossDetailState {
  data: Loss[];
  loading: boolean;
  leftTagExpand: boolean;
  rightTagExpand: boolean;
}
interface RequestParamsType {
  projectId: number;
  size: number;
}
interface Detail {
  title: string;
  position: MonitorPositionType;
  withExpandControl?: boolean;
  value: Monitor[] | string;
}
export default class LossDetail extends React.Component<LossDetailProps, LossDetailState> {
  state = {
    data: [{ name: '', type: LossType.TOTAL_LOSS, startMonitors: [], endMonitors: [] }],
    loading: false,
    leftTagExpand: false,
    rightTagExpand: false,
  };
  buttonEdit = () => {
    const { projectId, lossId } = this.props.match.params;
    this.props.history.push(Links.LossEdit([projectId, lossId]));
  };
  filterLossById = (dataSource: Loss[], lossId: string) => {
    return dataSource.filter(item => item.id === lossId);
  };
  // 数组转字符串
  arrToString = (arr: Monitor[] | undefined): string => {
    return Array.isArray(arr) ? arr.map(i => i.name || '').join(';') : '';
  };
  // 获取起始监测点组成的字符串
  getMonitor = (dataSource: Loss, type: MonitorPositionType): string => {
    switch (type) {
      case 'START':
        return this.arrToString(dataSource.startMonitors);
      case 'END':
        return this.arrToString(dataSource.endMonitors);
      default:
        return '';
    }
  };
  toggle = (position: MonitorPositionType): void => {
    if (position === MonitorPositionType.START) {
      this.setState({
        leftTagExpand: !this.state.leftTagExpand,
      });
    } else {
      this.setState({
        rightTagExpand: !this.state.rightTagExpand,
      });
    }
  };
  async componentDidMount() {
    this.setState({
      loading: true,
    });
    try {
      const requestParams: RequestParamsType = {
        projectId: Number(this.props.match.params.projectId),
        size: MAX_INT,
      };
      const response = await getLoss(requestParams);
      this.setState({
        data: this.filterLossById(response.content, this.props.match.params.lossId),
        loading: false,
      });
    } catch (error) {
      console.error(error);
    }
  }
  render() {
    const { leftTagExpand, rightTagExpand } = this.state;
    const arr = [
      { title: '损耗名称', value: this.state.data[0].name, offset: 0 },
      { title: '类型', value: LossTypeLabel[this.state.data[0].type], offset: 2 },
      {
        title: '起始监测点',
        value: this.state.data[0].startMonitors,
        withExpandControl: true,
        position: MonitorPositionType.START,
        offset: 0,
      },
      {
        title: '终止监测点',
        value: this.state.data[0].endMonitors,
        withExpandControl: true,
        position: MonitorPositionType.END,
        offset: 2,
      },
    ];
    return (
      <FormAbilityPage buttonArr={[{ text: '编辑', type: 'primary', click: this.buttonEdit }]}>
        <div className="c-loss-detail">
          <Spin spinning={this.state.loading}>
            <Row>
              {arr.map((value, index) => {
                const showAll = value.position === MonitorPositionType.START ? leftTagExpand : rightTagExpand;
                return (
                  <Col className="item" span={11} offset={value.offset}>
                    <span className="title">{`${value.title}:`}</span>
                    <br />
                    {!value.withExpandControl && <span className="value">{value.value}</span>}
                    {value.withExpandControl &&
                      value.value.map((item, index) => (
                        <span style={{ display: showAll || index < MAX_TAG_SHOW_COUNT ? 'inline' : 'none' }}>
                          {(item as Monitor).name};
                        </span>
                      ))}
                    {value.withExpandControl && (
                      <div
                        className="expand-control"
                        onClick={() => this.toggle(value.position)}
                        style={{ display: value.value.length > MAX_TAG_SHOW_COUNT ? 'block' : 'none' }}
                      >
                        <span>
                          {(value.position === MonitorPositionType.START
                          ? leftTagExpand
                          : rightTagExpand)
                            ? '收起'
                            : '展开'}
                        </span>
                        <Icon
                          type={
                            (value.position === MonitorPositionType.START
                            ? leftTagExpand
                            : rightTagExpand)
                              ? 'up'
                              : 'down'
                          }
                        />
                      </div>
                    )}
                  </Col>
                );
              })}
            </Row>
          </Spin>
        </div>
        <div className="c-loss-detail">
          <AbilityList title="配置该损耗对象可获得服务能力" all={LossAbility} current={LossAbility} />
        </div>
      </FormAbilityPage>
    );
  }
}
