import React, { CSSProperties } from 'react';
import { Col, Row, Spin } from 'antd';
import {
  AliIotCircuitDetail,
  aliIotGetCircuit,
  AliIotServiceCapability,
  CabinetTypeLabel,
  CircuitSubTypeLabelValue,
  CircuitTypeLabel,
  CircuitUsageTypeLabel,
  DeviceSourceType,
  DeviceSourceTypeLabel,
  LeftRightStatusLabel,
  getCapabilityByCircuit,
  getSpaceDetail,
  SpaceDetail,
  CircuitType,
} from '@maxtropy/kingfisher-api';
import { RouteComponentProps } from 'react-router-dom';
import FormAbilityPage from '../../Components/FormAbilityPage';
import AbilityList from '../../Components/AbilityList';
import { CircuitAbility } from '../CircuitAdd/config';
import DetailItem from '../../Components/DetailItem';
import { Links } from 'Breadcrumb/index';
import { circuitIsTie } from 'lib/util';

export type CircuitDetailProps = RouteComponentProps<{
  projectId: string;
  circuitId: string;
  siteId: string;
}>;
interface CircuitDetailState {
  data: AliIotCircuitDetail;
  spaceDetail: SpaceDetail[];
  abilityList: AliIotServiceCapability[];
  loading: boolean;
}
interface LabelArrType {
  title: string;
  span: number;
  value: string | number | undefined;
  style?: CSSProperties;
}
interface LabelValue {
  value: number;
  label: string;
}
export default class CircuitDetail extends React.Component<CircuitDetailProps, CircuitDetailState> {
  state: CircuitDetailState = {
    data: {
      cabinet: { name: '', type: 0 },
      name: '',
      type: 0,
      parent: undefined,
      use: 0,
      subtype: undefined,
      description: '',
      left: undefined,
      right: undefined,
      meter: { name: undefined },
      spaceId: '',
      deviceSourceType: DeviceSourceType.ALI_IOT_PLATFORM,
    },
    abilityList: [],
    spaceDetail: [],
    loading: false,
  };
  buttonEdit = () => {
    const { projectId, circuitId, siteId } = this.props.match.params;
    this.props.history.push(Links.CircuitEdit([projectId, siteId, circuitId]));
  };
  getCircuitDetail = async (circuitId: string): Promise<AliIotCircuitDetail> => {
    return await aliIotGetCircuit(circuitId);
  };
  getCapability = async (circuitId: string): Promise<AliIotServiceCapability[]> => {
    return await getCapabilityByCircuit(circuitId);
  };
  getSubTypeLabel = (dataSource: LabelValue[], targetValue: number | undefined): string | undefined => {
    let result = undefined;
    if (dataSource && dataSource.length && targetValue !== undefined) {
      let targetItem = dataSource.filter(item => item.value === targetValue);
      result = targetItem[0].label;
    }
    return result;
  };
  getSpaceDetail = async (projectId: number): Promise<SpaceDetail[]> => {
    return await getSpaceDetail(projectId);
  };
  async componentDidMount() {
    const { projectId, circuitId } = this.props.match.params;
    this.setState({
      loading: true,
    });
    try {
      const [responseCircuitDetail, responseAbilityList, responsSpaceList] = await Promise.all([
        this.getCircuitDetail(circuitId),
        this.getCapability(circuitId),
        this.getSpaceDetail(Number(projectId)),
      ]);
      this.setState({
        data: responseCircuitDetail,
        abilityList: responseAbilityList,
        loading: false,
        spaceDetail: responsSpaceList,
      });
    } catch (e) {
      console.error(e);
    }
  }
  render() {
    const { data, spaceDetail } = this.state;
    const subTypeLabel = this.getSubTypeLabel(CircuitSubTypeLabelValue[data.type || 0], data.subtype);
    const targetSpace = spaceDetail.filter(item => item.spaceId === data.spaceId);
    const isTie: boolean = data.type !== undefined && circuitIsTie(data.type);
    const labelArr: LabelArrType[] = [
      { title: '所在配电柜：', value: data.cabinet && data.cabinet.name, span: 12 },
      {
        title: '配电柜类型：',
        value: data.cabinet && data.cabinet.type ? CabinetTypeLabel[data.cabinet.type] : undefined,
        span: 12,
      },
      { title: '回路名称：', value: data.name, span: 12 },
      { title: '回路类型：', value: data.type && CircuitTypeLabel[data.type], span: 12 },
      { title: '上游回路：', value: isTie ? undefined : data.parent && data.parent.name, span: 12 },
      { title: '左上游回路：', value: isTie ? (data.left ? data.left.name : undefined) : undefined, span: 12 },
      { title: '右上游回路：', value: isTie ? (data.right ? data.right.name : undefined) : undefined, span: 12 },
      {
        title: '母联状态：',
        value: isTie
          ? data.leftRightState != undefined
            ? LeftRightStatusLabel[data.leftRightState]
            : undefined
          : undefined,
        span: 12,
      },
      { title: '附属回路：', value: subTypeLabel, span: 12 },
      { title: '用途：', value: data.use && CircuitUsageTypeLabel[data.use], span: 12 },
      { title: '备注：', value: data.description, span: 12 },
      {
        title: '数据采集',
        value: ' ',
        span: 24,
        style: { fontSize: 16, color: '#333333', fontWeight: 600, marginBottom: 18 },
      },
      {
        title: '设备来源：',
        value: DeviceSourceTypeLabel[data.deviceSourceType || DeviceSourceType.ALI_IOT_PLATFORM],
        span: 24,
      },
      { title: '采集设备：', value: (data.meter && data.meter.name) || '无采集表计', span: 24 },
      { title: '所属空间：', value: (targetSpace[0] && targetSpace[0].spaceName) || '无所属空间', span: 24 },
    ];
    return (
      <FormAbilityPage buttonArr={[{ text: '编辑', type: 'primary', click: this.buttonEdit }]}>
        <Spin spinning={this.state.loading}>
          <Row>
            {labelArr.map((item, index) => {
              return item.value ? (
                <Col key={index} span={item.span}>
                  <DetailItem title={item.title} value={item.value || ''} style={item.style} />
                </Col>
              ) : null;
            })}
          </Row>
        </Spin>
        <div>
          <AbilityList title="配置该回路后可获得服务模型" all={CircuitAbility} current={this.state.abilityList} />
        </div>
      </FormAbilityPage>
    );
  }
}
