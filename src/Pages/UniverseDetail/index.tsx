import React, { CSSProperties } from 'react';
import { Row, Col, Spin } from 'antd';
import {
  aliIotGetUniversalCircuit,
  UniversalCircuitTypeLabel,
  AliIotUniversalCircuitDetail,
  DeviceSourceType,
  DeviceSourceTypeLabel,
  getSpaceDetail,
  SpaceDetail,
  AliIotServiceCapability,
  getCapabilityByCircuit,
} from '@maxtropy/kingfisher-api';
import { RouteComponentProps } from 'react-router-dom';
import { Links } from 'Breadcrumb';
import { UniverseAbility } from '../UniverseAdd/config';
import FormAbilityPage from '../../Components/FormAbilityPage';
import AbilityList from '../../Components/AbilityList';
import DetailItem from '../../Components/DetailItem';

export type UniverseDetailProps = RouteComponentProps<{
  projectId: string;
  universeId: string;
  siteId: string;
}>;
interface UniverseDetailState {
  data: AliIotUniversalCircuitDetail;
  spaceDetail: SpaceDetail[];
  abilityList: AliIotServiceCapability[];
  loading: boolean;
}
interface LabelArrType {
  title: string;
  value: string | number | undefined;
  span: number;
  style?: CSSProperties;
}
// export interface UniverseDetailProps extends ProjectRouteProps {}
export default class UniverseDetail extends React.Component<UniverseDetailProps, UniverseDetailState> {
  state: UniverseDetailState = {
    data: {
      name: '',
      type: 701,
      description: '',
      deviceSourceType: DeviceSourceType.ALI_IOT_PLATFORM,
      meter: { name: '' },
      spaceId: '',
    },
    spaceDetail: [],
    abilityList: [],
    loading: false,
  };
  buttonEdit = () => {
    const { projectId, universeId, siteId } = this.props.match.params;
    this.props.history.push(Links.UniverseEdit([projectId, siteId, universeId]));
  };
  getUniversalCircuit = async (universeId: string): Promise<AliIotUniversalCircuitDetail> => {
    return await aliIotGetUniversalCircuit(universeId);
  };
  getSpaceDetail = async (projectId: number): Promise<SpaceDetail[]> => {
    return await getSpaceDetail(projectId);
  };
  getAbilityList = async (universeId: string): Promise<AliIotServiceCapability[]> => {
    return await getCapabilityByCircuit(universeId);
  };
  async componentDidMount() {
    const { universeId, projectId } = this.props.match.params;
    this.setState({
      loading: true,
    });
    try {
      const [responseUniversalCircuit, responseAbilityList, responsSpaceList] = await Promise.all([
        this.getUniversalCircuit(universeId),
        this.getAbilityList(universeId),
        this.getSpaceDetail(Number(projectId)),
      ]);
      this.setState({
        data: responseUniversalCircuit,
        spaceDetail: responsSpaceList,
        abilityList: responseAbilityList,
        loading: false,
      });
    } catch (error) {
      console.error(error);
    }
  }
  render() {
    const { data, spaceDetail } = this.state;
    const targetSpace = spaceDetail.filter(item => item.spaceId === data.spaceId);
    const labelArr: LabelArrType[] = [
      { title: '监测点名称：', value: data.name, span: 12 },
      { title: '类型：', value: data.type && UniversalCircuitTypeLabel[data.type], span: 12 },
      { title: '备注：', value: data.description, span: 24 },
      {
        title: '数据采集',
        value: undefined,
        span: 24,
        style: { fontSize: 16, color: '#333333', fontWeight: 600, marginBottom: 18 },
      },
      {
        title: '设备来源：',
        value: DeviceSourceTypeLabel[data.deviceSourceType || DeviceSourceType.ALI_IOT_PLATFORM],
        span: 24,
      },
      { title: '选择平台表计：', value: (data.meter && data.meter.name) || '无采集表计', span: 24 },
      { title: '所属空间：', value: (targetSpace[0] && targetSpace[0].spaceName) || '无所属空间', span: 24 },
    ];
    return (
      <FormAbilityPage buttonArr={[{ text: '编辑', type: 'primary', click: this.buttonEdit }]}>
        <Spin spinning={this.state.loading}>
          <Row className="c-universe-detail">
            {labelArr.map((item, index) => {
              let itemTitle = Object.keys(item)[0];
              let testValueKey = item[itemTitle];
              return (
                <Col key={index} span={item.span}>
                  <DetailItem title={item.title} value={item.value || ''} style={item.style} />
                </Col>
              );
            })}
          </Row>
        </Spin>
        <div>
          <AbilityList title="配置该监测点可使用服务模型" all={UniverseAbility} current={UniverseAbility} />
        </div>
      </FormAbilityPage>
    );
  }
}
