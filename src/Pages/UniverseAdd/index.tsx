import React from 'react';
import EnhancedForm from '@maxtropy/form';
import {
  aliIotCreateUniversalCircuit,
  aliIotGetUniversalCircuit,
  AliIotServiceCapability,
  AliIotUniversalCircuitDetail,
  AliIotUniversalCircuitForm,
  aliIotUpdateUniversalCircuit,
  DeviceSourceType,
  getCapabilityByCircuit,
} from '@maxtropy/kingfisher-api';
import { message } from 'antd';
import { Links } from 'Breadcrumb';
import FormAbilityPage from '../../Components/FormAbilityPage';
import Form, { UniverseAddFormValue, NO_METER } from './components/UniverseForm';
import AbilityList from '../../Components/AbilityList';
import { UniverseAbility } from './config';
import { RouteComponentProps } from 'react-router';

// export interface UniverseAddProps extends ProjectRouteProps {}
export type UniverseAddProps = RouteComponentProps<{
  projectId?: string;
  universeId?: string;
  siteId?: string;
}>;
interface UniverseAddState {
  abilityList: AliIotServiceCapability[];
}
export default class UniverseAdd extends React.Component<UniverseAddProps, UniverseAddState> {
  formRef: React.RefObject<EnhancedForm<UniverseAddFormValue>>;
  formDefaultValue: UniverseAddFormValue;
  isEdit: boolean;
  constructor(props: UniverseAddProps) {
    super(props);
    this.formRef = React.createRef<EnhancedForm<UniverseAddFormValue>>();
    this.isEdit = false;
    this.formDefaultValue = {
      name: '',
      type: 301,
      description: '',
      deviceSource: DeviceSourceType.ALI_IOT_PLATFORM,
      meter: undefined,
      spaceId: undefined,
    };
    this.state = {
      abilityList: [],
    };
  }
  init = (): void => {
    let url = document.location.toString();
    this.isEdit = url.includes('edit');
  };
  getDetailFormValue = (params: AliIotUniversalCircuitDetail): UniverseAddFormValue => {
    return {
      name: params.name || '',
      type: params.type,
      description: params.description || '',
      deviceSource: params.deviceSourceType || DeviceSourceType.ALI_IOT_PLATFORM,
      meter: (params.meter && params.meter.id) || NO_METER,
      spaceId: params.spaceId,
    };
  };
  buttonSave = (): void => {
    const { projectId, universeId, siteId } = this.props.match.params;
    if (this.formRef.current) {
      const { error, value } = this.formRef.current && this.formRef.current.validaFieldsAndScroll();
      if (!error) {
        let formValue: AliIotUniversalCircuitForm = {
          description: value.description,
          name: value.name,
          type: value.type,
          deviceSourceType: value.deviceSource,
          meterId: (value.meter && value.meter !== NO_METER && value.meter) || null,
          spaceId: (value.deviceSource === DeviceSourceType.MAXTROPY_PLATFORM && value.spaceId) || null,
          projectId: Number(projectId),
          siteId: siteId,
        };
        if (this.isEdit) {
          aliIotUpdateUniversalCircuit(universeId || '', formValue)
            .then(value => {
              message.success('监测点编辑成功！', 1, () => {
                this.props.history.push(Links.UniverseList(Number(projectId)));
              });
            })
            .catch(error => {
              console.error(error);
              message.error('提交信息失败，请重试！', 1);
            });
        } else {
          aliIotCreateUniversalCircuit(formValue)
            .then(value => {
              message.success('监测点创建成功！', 1, () => {
                this.props.history.push(Links.UniverseList(Number(projectId)));
              });
            })
            .catch(error => {
              console.error(error);
              message.error('提交信息失败，请重试！', 1);
            });
        }
      } else {
        console.error('表单错误');
      }
    }
  };
  buttonCancel = (): void => {
    this.props.history.goBack();
  };
  // 通过表记ID获取服务能力列表后，更新列表
  updateAbilityList = (value: AliIotServiceCapability[]): void => {
    this.setState({
      abilityList: value,
    });
  };
  getUniversalCircuit = async (universeId: string): Promise<AliIotUniversalCircuitDetail> => {
    return await aliIotGetUniversalCircuit(universeId);
  };
  getCapability = async (universeId: string): Promise<AliIotServiceCapability[]> => {
    return await getCapabilityByCircuit(universeId);
  };
  async componentDidMount() {
    const { universeId } = this.props.match.params;
    this.init();
    if (this.isEdit) {
      if (universeId) {
        // 获取监测点详情,能力列表
        const [responseUniverseDetail, responseAbilityList] = await Promise.all([
          this.getUniversalCircuit(universeId),
          this.getCapability(universeId),
        ]);
        this.formDefaultValue = this.getDetailFormValue(responseUniverseDetail);
        this.setState({
          abilityList: responseAbilityList,
        });
      }
    }
  }
  render() {
    const { projectId } = this.props.match.params;
    return (
      <FormAbilityPage
        buttonArr={[
          { text: '提交', type: 'primary', click: this.buttonSave },
          { text: '取消', click: this.buttonCancel },
        ]}
      >
        <div className="c-universe-add">
          <EnhancedForm
            ref={this.formRef}
            defaultValue={this.formDefaultValue}
            editing={true}
            render={renderProps => (
              <Form
                {...renderProps}
                projectId={Number(projectId)}
                defaultValue={this.formDefaultValue}
                updateAbilityList={this.updateAbilityList}
              />
            )}
          />
        </div>
        <div>
          <AbilityList title="配置该监测点后可使用服务模型" all={UniverseAbility} current={this.state.abilityList} />
        </div>
      </FormAbilityPage>
    );
  }
}
