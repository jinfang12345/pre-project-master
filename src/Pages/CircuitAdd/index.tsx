import React from 'react';
import EnhancedForm from '@maxtropy/form';
import {
  AliIotCircuitDetail,
  AliIotCircuitForm,
  aliIotCreateCircuit,
  aliIotGetCircuit,
  AliIotServiceCapability,
  aliIotUpdateCircuit,
  Cabinet,
  CabinetForm,
  CabinetType,
  CircuitSubTypeLabelValue,
  CircuitType,
  DeviceSourceType,
  getCapabilityByCircuit,
  postCabinet,
} from '@maxtropy/kingfisher-api';
import { message } from 'antd';
import { RouteComponentProps } from 'react-router-dom';
import FormAbilityPage from '../../Components/FormAbilityPage';
import AbilityList from '../../Components/AbilityList';
import { CircuitAbility } from './config';
import { Ability } from 'Components/Preview';
import Form, { CircuitAddFormValue, NO_METER } from './components/CircuitAddForm';
import { Links } from 'Breadcrumb/index';
import { circuitIsTie } from 'lib/util';

type CircuitAddProps = RouteComponentProps<{
  projectId: string;
  siteId: string;
  circuitId?: string;
}>;
interface CircuitAddState {
  abilityList: AliIotServiceCapability[];
  cabinetName?: string;
}
export default class CircuitAdd extends React.Component<CircuitAddProps, CircuitAddState> {
  formRef: React.RefObject<EnhancedForm<CircuitAddFormValue>>;
  formDefaultValue: CircuitAddFormValue;
  isEdit: boolean;
  constructor(props: CircuitAddProps) {
    super(props);
    this.formRef = React.createRef<EnhancedForm<CircuitAddFormValue>>();
    this.formDefaultValue = {
      cabinet: undefined,
      cabinetType: CabinetType.V400,
      name: '',
      type: CircuitType.V400_OUTGOING_FEEDER,
      use: undefined,
      description: '',
      deviceSourceType: DeviceSourceType.ALI_IOT_PLATFORM,
      meter: undefined,
      spaceId: undefined,
    };
    this.isEdit = false;
    this.state = {
      abilityList: [],
      cabinetName: undefined,
    };
  }
  init = (): void => {
    const url = document.location.toString();
    const { circuitId } = this.props.match.params;
    this.isEdit = url.includes('edit') && !!circuitId;
  };
  setCabinetName = (cabinetName: string): void => {
    this.setState({
      cabinetName,
    });
  };
  buttonSave = async (): Promise<void> => {
    const { projectId, siteId, circuitId } = this.props.match.params;
    if (this.formRef.current) {
      const { error, value } = this.formRef.current && this.formRef.current.validaFieldsAndScroll();
      if (!error) {
        // 判断配电柜是否是新添的
        const isAddCabinet = /^addCabinet[0-9]+/.test(value.cabinet || '');
        let responseCabinet: Cabinet | undefined;
        if (isAddCabinet) {
          const cabinetValue: CabinetForm = {
            name: this.state.cabinetName,
            siteId: siteId,
            type: value.cabinetType,
          };
          responseCabinet = await postCabinet(cabinetValue);
        }
        const cabinetId = responseCabinet ? responseCabinet.id : value.cabinet;
        let formValue: AliIotCircuitForm = {
          cabinetName: this.state.cabinetName,
          cabinetId: cabinetId,
          cabinetType: value.cabinetType,
          description: value.description,
          deviceSourceType: value.deviceSourceType,
          meterId: (value.meter && value.meter !== NO_METER && value.meter) || null,
          name: value.name,
          // 只有极熵平台才传spaceId
          spaceId: (value.deviceSourceType === DeviceSourceType.MAXTROPY_PLATFORM && value.spaceId) || null,
          parentId: !circuitIsTie(value.type) ? value.parent : undefined,
          leftId: circuitIsTie(value.type) ? (value.left ? value.left : undefined) : undefined,
          rightId: circuitIsTie(value.type) ? (value.right ? value.right : undefined) : undefined,
          leftRightState: circuitIsTie(value.type) ? value.leftRightStatus : undefined,
          projectId: Number(projectId),
          siteId: siteId,
          type: value.type,
          use: value.use,
        };
        if (this.isEdit) {
          aliIotUpdateCircuit(circuitId as string, formValue)
            .then(() => {
              message.success('回路编辑成功！', 1, () => {
                this.props.history.push(Links.CircuitList(Number(projectId)));
              });
            })
            .catch((error: any) => {
              console.error(error);
              message.error('提交信息失败，请重试！', 1);
            });
        } else {
          aliIotCreateCircuit(formValue)
            .then(() => {
              message.success('回路创建成功!', 1, () => {
                this.props.history.push(Links.CircuitList(Number(projectId)));
              });
            })
            .catch((error: any) => {
              console.error(error);
              message.error('提交信息失败，请重试！', 1);
            });
        }
      } else {
        console.error('表单校验失败', error);
      }
    }
  };
  getNewFormDefault = (params: AliIotCircuitDetail): CircuitAddFormValue => {
    let newDefaultValue: CircuitAddFormValue = this.formDefaultValue;
    let circuitSubType = CircuitSubTypeLabelValue[params.type || 0];
    const isTie: boolean = params.type !== undefined && circuitIsTie(params.type);
    if (params) {
      newDefaultValue = {
        cabinet: (params.cabinet && params.cabinet.id) || '',
        cabinetType: (params.cabinet && params.cabinet.type) || CabinetType.V400,
        name: params.name || '',
        parent: isTie ? undefined : params.parent && params.parent.id,
        left: isTie ? (params.left ? params.left.id : undefined) : undefined,
        right: isTie ? (params.right ? params.right.id : undefined) : undefined,
        leftRightStatus: params.leftRightState,
        type: params.type || CircuitType.V400_OUTGOING_FEEDER,
        use: params.use,
        subType: circuitSubType ? params.subtype : undefined,
        description: params.description || '',
        deviceSourceType: params.deviceSourceType || DeviceSourceType.ALI_IOT_PLATFORM,
        meter: (params.meter && params.meter.id) || NO_METER,
        spaceId: params.spaceId,
      };
    }
    return newDefaultValue;
  };
  buttonCancel = () => {
    const { projectId } = this.props.match.params;
    this.props.history.push(Links.CircuitList(Number(projectId)));
  };
  // 通过表记ID获取服务能力列表后，更新列表
  updateAbilityList = (value: Ability[]): void => {
    this.setState({
      abilityList: value,
    });
  };
  getCircuitDetail = async (circuitId: string): Promise<AliIotCircuitDetail> => {
    return await aliIotGetCircuit(circuitId);
  };
  getCapability = async (circuitId: string): Promise<AliIotServiceCapability[]> => {
    return await getCapabilityByCircuit(circuitId);
  };
  async componentDidMount() {
    this.init();
    const { circuitId } = this.props.match.params;
    if (this.isEdit) {
      if (circuitId) {
        const [responseCircuit, responseAbilityList] = await Promise.all([
          this.getCircuitDetail(circuitId),
          this.getCapability(circuitId),
        ]);
        this.formDefaultValue = this.getNewFormDefault(responseCircuit);
        this.setState({
          abilityList: responseAbilityList,
          cabinetName: responseCircuit.cabinet && responseCircuit.cabinet.name,
        });
      }
    }
  }
  render() {
    return (
      <FormAbilityPage
        buttonArr={[
          { text: '提交', type: 'primary', click: this.buttonSave },
          { text: '取消', type: '', click: this.buttonCancel },
        ]}
      >
        <div className="c-circuit-add">
          <EnhancedForm
            ref={this.formRef}
            defaultValue={this.formDefaultValue}
            editing={true}
            render={(renderProps: any) => (
              <Form
                {...renderProps}
                projectId={+this.props.match.params.projectId}
                siteId={this.props.match.params.siteId}
                circuitId={this.props.match.params.circuitId}
                updateAbilityList={this.updateAbilityList}
                defaultValue={this.formDefaultValue}
                setCabinetName={(cabinetName: string): void => this.setCabinetName(cabinetName)}
              />
            )}
          />
        </div>
        <div>
          <AbilityList title="配置该回路后可使用服务模型" all={CircuitAbility} current={this.state.abilityList} />
        </div>
      </FormAbilityPage>
    );
  }
}
