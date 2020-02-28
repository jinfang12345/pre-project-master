import React from 'react';
import { Col, Divider, Form, Icon, Input, Radio, Select, Spin, TreeSelect } from 'antd';
import {
  aliIotGetCapabilityByMeter,
  aliIotGetMeters,
  AliIotServiceCapability,
  Cabinet,
  CabinetType,
  cabinetType2CircuitType,
  CabinetTypeLabel,
  CircuitSubTypeLabelValue,
  CircuitType,
  CircuitTypeLabel,
  CircuitUsageType,
  CircuitUsageTypeLabel,
  deleteEmptyCabinets,
  DeviceSourceType,
  generateLabelList,
  getCabinets,
  getCircuitTree,
  getSpaceDetail,
  LeftRightStatusLabel,
  LeftRightType,
  Meter,
  MeterType,
  SpaceDetail,
} from '@maxtropy/kingfisher-api';
import EnhancedForm, { RenderProps } from '@maxtropy/form';
import { RadioChangeEvent } from 'antd/lib/radio';
import { SelectValue } from 'antd/lib/select';
import './index.less';
import { filterMeterOptions } from '../../../UniverseAdd/components/UniverseForm';
import Modal from '../../../../Components/Modal';
import { transTreeData } from '../../../LossAdd';
import CabinetAddForm, { InputValue } from 'Components/CabinetAddForm';
import { TreeNodeNormal } from 'antd/lib/tree-select/interface';
import { CHN_NAME_REGEXP, circuitIsTie } from 'lib/util';

const Fragment = React.Fragment;
const { OptGroup } = Select;
export const NO_METER = 'noMeter';
export interface CircuitAddFormValue {
  cabinet?: string; //配电柜
  cabinetType: CabinetType; //配电柜类型
  name: string; //回路名称
  type: CircuitType; //回路类型
  use?: number; //用途
  subType?: number; //附属回路
  description: string; //备注
  deviceSourceType: DeviceSourceType; //设备来源
  meter?: string; //表计信息
  spaceId?: string; //空间信息
  parent?: string;
  left?: string;
  right?: string;
  leftRightStatus?: number;
}
interface CircuitAddFormProps extends RenderProps<CircuitAddFormValue> {
  projectId: number;
  siteId?: string;
  circuitId?: string;
  updateAbilityList: (value: AliIotServiceCapability[]) => void;
  defaultValue: CircuitAddFormValue;
  setCabinetName: (cabinetName: string) => void;
}
interface CircuitAddFormState {
  cabinetOptions: Cabinet[];
  treeDataSource: TreeNodeNormal[];
  modalVisible: boolean;
  iotMeterOptions: Meter[];
  maxtropyMeterOptions: Meter[];
  namePathOptions: SpaceDetail[];
  hasChoosenCabinet: boolean;
  loading: boolean;
}
const Option = Select.Option;
const RadioGroup = Radio.Group;
const cabinetTypeOptions = generateLabelList(CabinetTypeLabel, [
  CabinetType.V400,
  CabinetType.V10K,
  CabinetType.V35K,
  CabinetType.TRANSFORMER,
]);
const circuitUsageOptions = generateLabelList(CircuitUsageTypeLabel, [
  CircuitUsageType.ILLUMINATION,
  CircuitUsageType.AIR_CONDITIONING,
  CircuitUsageType.POWER,
  CircuitUsageType.OTHER,
]);
const LeftRightStatusOptions = generateLabelList(LeftRightStatusLabel, [
  LeftRightType.DISCONNECT,
  LeftRightType.FROM_LEFT,
  LeftRightType.FROM_RIGHT,
]);

function filterNode(roots: TreeNodeNormal[], filter: (node: TreeNodeNormal) => boolean): TreeNodeNormal[] {
  if (!roots.length) return [];
  let result: TreeNodeNormal[] = [];
  for (const node of roots) {
    if (filter(node)) {
      const newNode: TreeNodeNormal = {
        ...node,
        children: node.children && filterNode(node.children, filter),
      };
      result.push(newNode);
    } else if (node.children) {
      result = result.concat(filterNode(node.children, filter));
    }
  }
  return result;
}

function filterSubTree(roots: TreeNodeNormal[], filter: (node: TreeNodeNormal) => boolean): TreeNodeNormal[] {
  return roots.filter(filter).map(
    (node): TreeNodeNormal => ({
      ...node,
      children: node.children && filterSubTree(node.children, filter),
    }),
  );
}
// 按创建事件降序排标记
export function descByCreatetime(a: Meter, b: Meter): number {
  if (a.createTime && b.createTime) {
    return b.createTime - a.createTime;
  }
  return 0;
}
// 对超过15字的空间名称省略显示
export function transSpaceName(spaceName: string | undefined | null): string {
  if (spaceName) {
    if (spaceName.length > 15) {
      return spaceName.substring(0, 7) + '...' + spaceName.substring(spaceName.length - 8);
    }
    return spaceName;
  }
  return '';
}
export default class CircuitAddForm extends React.Component<CircuitAddFormProps, CircuitAddFormState> {
  formRef: React.RefObject<EnhancedForm<InputValue>>;
  treeDataAll: TreeNodeNormal[];
  isEdit: boolean;
  modalDefaultvalue: InputValue;
  initPromise: Promise<void>;
  constructor(props: CircuitAddFormProps) {
    super(props);
    this.treeDataAll = [];
    this.state = {
      cabinetOptions: [{ name: '', id: '' }],
      treeDataSource: [],
      iotMeterOptions: [],
      maxtropyMeterOptions: [],
      namePathOptions: [],
      modalVisible: false,
      hasChoosenCabinet: false,
      loading: false,
    };
    this.initPromise = new Promise((resolve, reject) => {});
    this.isEdit = false;
    this.formRef = React.createRef<EnhancedForm<InputValue>>();
    this.modalDefaultvalue = {
      name: '',
    };
  }
  radioChange = (): void => {
    this.props.form.setFieldValue('meter', NO_METER);
    this.props.form.setFieldValue('spaceId', undefined);
    this.props.updateAbilityList([]);
  };
  // 根据配电柜类型重置回路类型默认值
  updateCircuitTypeByType = (cabinetType: CabinetType | undefined) => {
    switch (cabinetType) {
      case CabinetType.V10K:
        this.props.form.setFieldValue('type', CircuitType.V10K_OUTGOING_FEEDER);
        break;
      case CabinetType.V400:
        this.props.form.setFieldValue('type', CircuitType.V400_OUTGOING_FEEDER);
        break;
      case CabinetType.TRANSFORMER:
        this.props.form.setFieldValue('type', CircuitType.TRANSFORMER);
        break;
      case CabinetType.V35K:
        this.props.form.setFieldValue('type', CircuitType.V35K_OUTGOING_FEEDER);
        break;
      default:
        this.props.form.setFieldValue('type', CircuitType.V400_OUTGOING_FEEDER);
    }
  };
  cabinetChange = (value: SelectValue): void => {
    let selectedCabine = this.filterByCabinetId(this.state.cabinetOptions, value as string);
    if (selectedCabine) {
      this.props.form.setFieldValue('cabinetType', selectedCabine[0].type || CabinetType.V400);
      this.props.setCabinetName(selectedCabine[0].name || '');
      this.updateCircuitTypeByType(selectedCabine[0].type);
      // 配电柜选择后，配电柜类型不可变
      this.setState({
        hasChoosenCabinet: !(selectedCabine[0].id && /^addCabinet[0-9]+/.test(selectedCabine[0].id)),
      });
    }
  };
  cabinetTypeChange = (value: CabinetType): void => {
    this.updateCircuitTypeByType(value);
    // 修改配电柜也可能会获取新的回路附属
    this.typeChange(this.props.form.getFieldValue('type') as CircuitType);
  };
  // 回路类型的修改会引起回路附属、左右上游回路的变化
  typeChange = (value: CircuitType): void => {
    let treeData = this.treeDataAll;
    // 如果回路类型为母联，则不能选计费进线
    if (circuitIsTie(value)) {
      treeData = filterNode(this.treeDataAll, node => !node.key.includes('m'));
      if (this.isEdit) {
        treeData = this.getLRcircuitOptions(treeData, this.props.circuitId || '');
      }
    } else if (this.props.circuitId) {
      treeData = filterSubTree(this.treeDataAll, node => node.key !== this.props.circuitId);
    }
    this.setState({
      treeDataSource: treeData,
    });
  };
  // 对获取到的配电柜列表进行排序(根据创建时间倒序)
  cabinetSort = (a: Cabinet, b: Cabinet) => {
    if (a.createTime && b.createTime) return b.createTime - a.createTime;
    else return 0;
  };
  // 根据所选配电柜的ID查type
  filterByCabinetId = (dataSource: Cabinet[], option: string) => {
    return dataSource && dataSource.filter(item => item.id == option);
  };
  filterBySiteId = (dataSource: Cabinet[], option: string | undefined) => {
    return dataSource && dataSource.filter(item => item.site && item.site.id == option);
  };
  getCircuitTypeOptions = (cabinetType: number) => {
    let circuitType = cabinetType2CircuitType(cabinetType);
    return generateLabelList(CircuitTypeLabel, [...circuitType]);
  };
  // 获取附属回路options
  getCircuitSubTypeOptions = (type: number) => {
    let circuitSubType = CircuitSubTypeLabelValue[type];
    if (circuitSubType) {
      return circuitSubType;
    } else {
      return [];
    }
  };
  // 关闭Modal
  closeModal = (): void => {
    this.setState(
      {
        modalVisible: false,
      },
      () => {
        this.formRef.current && this.formRef.current.setFieldValue('name', '');
      },
    );
  };
  confirmModal = (): void => {
    if (this.formRef.current) {
      const { error, value } = this.formRef.current && this.formRef.current.validateFields();
      if (!error) {
        // 新增配电柜时，前端先过滤之前的新增配电柜
        let currentCabinetsWithoutNew = this.state.cabinetOptions.filter(
          item => !(item.id || '').includes('addCabinet'),
        );
        this.props.setCabinetName(value.name || '');
        let newCabinetItem: Cabinet = {
          id: 'addCabinet' + new Date().valueOf(),
          name: value.name || '',
        };
        currentCabinetsWithoutNew.unshift(newCabinetItem);
        this.setState(
          {
            cabinetOptions: currentCabinetsWithoutNew,
            hasChoosenCabinet: false,
          },
          () => {
            this.props.form.setFieldValue('cabinet', newCabinetItem.id as string);
            this.props.form.setFieldValue('cabinetType', CabinetType.V400);
            this.cabinetTypeChange(CabinetType.V400);
            this.closeModal();
          },
        );
      }
    }
  };
  showModal = (): void => {
    this.setState({
      modalVisible: true,
    });
  };
  currIsEdit = (url: string): void => {
    this.isEdit = url.includes('edit') && !!this.props.circuitId;
  };
  onMeterChange = async (value: SelectValue) => {
    // 调接口获取能力列表
    try {
      if (value.toString() !== NO_METER) {
        let resCapabilityList = await aliIotGetCapabilityByMeter(value as string);
        this.props.updateAbilityList(resCapabilityList);
      } else {
        this.props.updateAbilityList([]);
      }
    } catch (error) {
      console.error(error);
    }
    if (this.props.form.getFieldValue('deviceSourceType') === DeviceSourceType.ALI_IOT_PLATFORM) {
      const targetItem = this.state.iotMeterOptions.filter(item => item.id === (value as string));
      if (targetItem && targetItem.length && targetItem[0].spaceId) {
        this.props.form.setFieldValue('spaceId', targetItem[0].spaceId);
      }
    }
  };
  getLRcircuitOptions = (dataSource: TreeNodeNormal[], targetKey: string): TreeNodeNormal[] => {
    let temp = dataSource.filter(i => i.key !== targetKey);
    return temp.map(i => {
      if (i.children && i.children.length) {
        return {
          ...i,
          children: this.getLRcircuitOptions(i.children, targetKey),
        };
      } else {
        return i;
      }
    });
  };
  deleteEmptyCabinet = async () => {
    const { projectId } = this.props;
    try {
      await deleteEmptyCabinets(projectId);
      this.setState(
        {
          cabinetOptions: this.state.cabinetOptions.filter(item => item.circuitList && item.circuitList.length),
          hasChoosenCabinet: false,
        },
        () => {
          this.props.form.setFieldValue('cabinet', undefined);
        },
      );
    } catch (error) {
      console.error(error);
    }
  };
  getLRCircuitShow = (): boolean => {
    const currCircuitType = this.props.form.getFieldValue('type') as CircuitType;
    if (circuitIsTie(currCircuitType)) {
      return true;
    }
    return false;
  };
  // 获取设备来源为IOT平台时，空间属性的名称
  getIotSpaceName = (): string => {
    let result = '';
    const currentSpaceId = this.props.form.getFieldValue('meter');
    const targetItem = this.state.iotMeterOptions.filter(item => item.id === currentSpaceId);
    if (targetItem && targetItem.length) {
      result = targetItem[0].spaceName || '';
    }
    return result;
  };

  async componentDidMount() {
    this.currIsEdit(document.location.toString());
    const { projectId, siteId } = this.props;
    this.setState({
      loading: true,
      hasChoosenCabinet: this.isEdit,
    });
    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        // 设备来源为iot平台时，空间信息在表记列表信息中，极熵平台时，resSpaceDetail为空间信息
        const [
          responseCabinets,
          resSpaceDetail,
          resIotMeterList,
          resMaxtropyMetertList,
          responseTreeData,
        ] = await Promise.all([
          getCabinets({ projectId }),
          getSpaceDetail(projectId),
          aliIotGetMeters({ projectId, deviceSourceType: DeviceSourceType.ALI_IOT_PLATFORM }),
          aliIotGetMeters({ projectId, deviceSourceType: DeviceSourceType.MAXTROPY_PLATFORM }),
          getCircuitTree(projectId),
        ]);
        const responseCabinetFilter = this.filterBySiteId(responseCabinets.content, siteId);
        this.treeDataAll = transTreeData(responseTreeData);
        this.setState(
          {
            cabinetOptions: responseCabinetFilter && responseCabinetFilter.sort(this.cabinetSort),
            treeDataSource: this.treeDataAll,
            iotMeterOptions: filterMeterOptions(resIotMeterList, MeterType.ELECTRIC, DeviceSourceType.ALI_IOT_PLATFORM),
            maxtropyMeterOptions: filterMeterOptions(
              resMaxtropyMetertList,
              MeterType.ELECTRIC,
              DeviceSourceType.MAXTROPY_PLATFORM,
            ),
            namePathOptions: resSpaceDetail,
            loading: false,
          },
          () => resolve(),
        );
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  }
  async componentDidUpdate(
    prevProps: Readonly<CircuitAddFormProps>,
    prevState: Readonly<CircuitAddFormState>,
    snapshot?: any,
  ) {
    if (prevProps.defaultValue !== this.props.defaultValue) {
      // 如果use为-1，改为undefined
      await this.initPromise;
      let transDefaultValue = this.props.defaultValue;
      this.typeChange(this.props.defaultValue.type);
      if (this.props.defaultValue.use === -1) {
        transDefaultValue = {
          ...this.props.defaultValue,
          use: undefined,
        };
      }
      this.props.form.setFormValue(transDefaultValue);
    }
  }
  render() {
    const { cabinetOptions, iotMeterOptions, maxtropyMeterOptions } = this.state;
    const { fieldDecorators, getFieldValue } = this.props.form;
    const CircuitTypeOptions = this.getCircuitTypeOptions(getFieldValue('cabinetType') as number);
    // 获取附属回路Options
    const circuitSubTypeOptions = this.getCircuitSubTypeOptions(getFieldValue('type') as number);
    // 是否显示左右上游回路
    const showLRParentCircuit: boolean = this.getLRCircuitShow();
    const IotSpaceName =
      getFieldValue('deviceSourceType') === DeviceSourceType.MAXTROPY_PLATFORM ? '' : this.getIotSpaceName();
    return (
      <div className="c-add-circuit-form">
        <Modal
          title="配电柜"
          visible={this.state.modalVisible}
          handleCancel={this.closeModal}
          handleOk={this.confirmModal}
        >
          <EnhancedForm
            defaultValue={this.modalDefaultvalue}
            editing={true}
            ref={this.formRef}
            render={renderProps => <CabinetAddForm {...renderProps} />}
          />
        </Modal>
        <Spin spinning={this.state.loading}>
          <div className="basic-info-form-list">
            <Form className="circuit-form-item">
              {fieldDecorators.select({
                fieldName: 'cabinet',
                label: '所在配电柜',
                rules: [
                  {
                    required: true,
                    message: '请选择配电柜',
                  },
                ],
              })(
                <Select
                  dropdownRender={menu => (
                    <div>
                      {menu}
                      <Divider style={{ margin: '4px 0' }} />
                      <div
                        style={{ padding: '8px', cursor: 'pointer' }}
                        onMouseDown={e => {
                          e.preventDefault();
                          return false;
                        }}
                        onClick={this.deleteEmptyCabinet}
                      >
                        删除空配电柜
                      </div>
                      <Divider style={{ margin: '4px 0' }} />
                      <div
                        style={{ padding: '8px', cursor: 'pointer' }}
                        onMouseDown={e => {
                          e.preventDefault();
                          return false;
                        }}
                        onClick={this.showModal}
                      >
                        <Icon type="plus" /> 添加配电柜
                      </div>
                    </div>
                  )}
                  placeholder="请选择"
                  onChange={this.cabinetChange}
                >
                  {cabinetOptions.map((item, index) => (
                    <Option key={index} value={item.id as string}>
                      {item.name}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form>
            <Form className="circuit-form-item">
              {fieldDecorators.select({
                fieldName: 'cabinetType',
                label: '配电柜类型',
                rules: [
                  {
                    required: true,
                    message: '请选择配电柜',
                  },
                ],
              })(
                <Select<CabinetType> onChange={this.cabinetTypeChange} disabled={this.state.hasChoosenCabinet}>
                  {cabinetTypeOptions.map((item, index) => (
                    <Option key={index} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form>
            <Form className="circuit-form-item">
              {fieldDecorators.input({
                fieldName: 'name',
                label: '回路名称',
                rules: [
                  {
                    required: true,
                    message: '回路名称不能为空',
                  },
                  {
                    max: 15,
                    message: '名称不超过15个字符',
                  },
                  {
                    pattern: CHN_NAME_REGEXP,
                    message: '名称仅支持中文、英文大小写、数字和下划线',
                  },
                ],
              })(<Input placeholder="请输入名称" />)}
            </Form>
            <Form className="circuit-form-item">
              {fieldDecorators.select({
                fieldName: 'type',
                label: '回路类型',
                rules: [
                  {
                    required: true,
                    message: '请选择回路类型',
                  },
                ],
              })(
                <Select onChange={this.typeChange}>
                  {CircuitTypeOptions.map((item, index) => (
                    <Option key={index} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form>
            {showLRParentCircuit ? (
              <Fragment>
                <Form className="circuit-form-item">
                  {fieldDecorators.select({
                    fieldName: 'left',
                    label: '左上游回路',
                    rules: [
                      {
                        required: true,
                        message: '请选择',
                      },
                    ],
                  })(
                    <TreeSelect
                      style={{ width: '100%' }}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      treeData={this.state.treeDataSource}
                      placeholder="请选择"
                      treeDefaultExpandAll
                    />,
                  )}
                </Form>
                <Form className="circuit-form-item">
                  {fieldDecorators.select({
                    fieldName: 'right',
                    label: '右上游回路',
                    rules: [
                      {
                        required: true,
                        message: '请选择',
                      },
                    ],
                  })(
                    <TreeSelect
                      style={{ width: '100%' }}
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      treeData={this.state.treeDataSource}
                      placeholder="请选择"
                      treeDefaultExpandAll
                    />,
                  )}
                </Form>
                <Form className="circuit-form-item">
                  {fieldDecorators.select({
                    fieldName: 'leftRightStatus',
                    label: '母联状态',
                    rules: [
                      {
                        required: true,
                        message: '请选择',
                      },
                    ],
                  })(
                    <Select>
                      {LeftRightStatusOptions.map((item, index) => (
                        <Option value={item.value} key={index}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>,
                  )}
                </Form>
              </Fragment>
            ) : (
              <Form className="circuit-form-item">
                {fieldDecorators.select({
                  fieldName: 'parent',
                  label: '上游回路',
                  rules: [
                    {
                      required: true,
                      message: '请选择',
                    },
                  ],
                })(
                  <TreeSelect
                    style={{ width: '100%' }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={this.state.treeDataSource}
                    placeholder="请选择"
                    treeDefaultExpandAll
                  />,
                )}
              </Form>
            )}
            {circuitSubTypeOptions && circuitSubTypeOptions.length ? (
              <Form className="circuit-form-item">
                {fieldDecorators.select({
                  fieldName: 'subType',
                  label: '回路附属',
                  rules: [
                    {
                      required: true,
                      message: '请选择回路附属',
                    },
                  ],
                })(
                  <Select>
                    {circuitSubTypeOptions.map((item, index) => (
                      <Option value={item.value} key={index}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>,
                )}
              </Form>
            ) : null}
            <Form className="circuit-form-item">
              {fieldDecorators.select({
                fieldName: 'use',
                label: '用途',
              })(
                <Select placeholder="请选择">
                  {circuitUsageOptions.map((item, index) => (
                    <Option value={item.value} key={index}>
                      {item.label}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form>
            <Form className="circuit-form-item">
              {fieldDecorators.input({
                fieldName: 'description',
                label: '备注',
                rules: [
                  {
                    max: 50,
                    message: '输入不得超过50个字符',
                  },
                ],
              })(<Input placeholder="请输入备注" />)}
            </Form>
          </div>
          <div className="label">数据采集</div>
          <div>
            <Form>
              {fieldDecorators.radioGroup({
                fieldName: 'deviceSourceType',
                label: '设备来源',
                rules: [
                  {
                    required: true,
                  },
                ],
              })(
                <RadioGroup onChange={this.radioChange}>
                  <Radio value={DeviceSourceType.ALI_IOT_PLATFORM}>阿里云IoT平台</Radio>
                  <Radio value={DeviceSourceType.MAXTROPY_PLATFORM}>极熵平台</Radio>
                </RadioGroup>,
              )}
            </Form>
          </div>
          <div className="basic-info-form-list">
            {getFieldValue('deviceSourceType') === DeviceSourceType.ALI_IOT_PLATFORM ? (
              <Fragment>
                <Form className="circuit-form-item">
                  {fieldDecorators.select({
                    fieldName: 'meter',
                    label: '采集设备',
                    rules: [
                      {
                        required: true,
                        message: '请选择',
                      },
                    ],
                  })(
                    <Select
                      placeholder="请选择"
                      showSearch
                      filterOption={(input, option) =>
                        option.props.title && `${option.props.title}`.toLowerCase().includes(input.toLowerCase())
                      }
                      onChange={this.onMeterChange}
                      optionLabelProp="title"
                    >
                      <OptGroup label="未与回路绑定设备">
                        {(iotMeterOptions.filter(item => !item.bind).sort(descByCreatetime) as Meter[]).map(meter => (
                          <Option value={meter.id} key={meter.id} title={meter.name}>
                            <div>
                              <span style={{ color: '#333333', fontWeight: 500 }}>{meter.name}</span>
                              <br />
                              <span style={{ color: '#9C9C9C' }}>{transSpaceName(meter.spaceName)}</span>
                            </div>
                          </Option>
                        ))}
                      </OptGroup>
                      <OptGroup label="与回路绑定设备">
                        {(iotMeterOptions.filter(item => item.bind).sort(descByCreatetime) as Meter[]).map(meter => (
                          <Option value={meter.id} key={meter.id} title={meter.name}>
                            <div>
                              <span style={{ color: '#333333', fontWeight: 500 }}>{meter.name}</span>
                              <br />
                              <span style={{ color: '#9C9C9C' }}>{transSpaceName(meter.spaceName)}</span>
                            </div>
                          </Option>
                        ))}
                      </OptGroup>
                      <OptGroup label="无采集设备">
                        <Option value={NO_METER} key={NO_METER} title="无采集设备">
                          <div>
                            <span style={{ color: '#333333', fontWeight: 500 }}>无采集设备</span>
                            <br />
                            <span style={{ color: '#9C9C9C' }}>{''}</span>
                          </div>
                        </Option>
                      </OptGroup>
                    </Select>,
                  )}
                </Form>
                {getFieldValue('meter') && (
                  <Col span={24}>
                    <p>所属空间：</p>
                    <p style={{ color: '#000000' }}>{IotSpaceName}</p>
                  </Col>
                )}
              </Fragment>
            ) : (
              <Fragment>
                <Form className="circuit-form-item">
                  {fieldDecorators.select({
                    fieldName: 'meter',
                    label: '采集设备',
                    rules: [
                      {
                        required: true,
                        message: '请选择',
                      },
                    ],
                  })(
                    <Select
                      placeholder="请选择"
                      showSearch
                      filterOption={(input, option) =>
                        option.props.title && `${option.props.title}`.toLowerCase().includes(input.toLowerCase())
                      }
                      onChange={this.onMeterChange}
                    >
                      <OptGroup label="未与回路绑定设备">
                        {(maxtropyMeterOptions.filter(item => !item.bind).sort(descByCreatetime) as Meter[]).map(
                          meter => (
                            <Option value={meter.id} key={meter.id} title={meter.name}>
                              <div>
                                <span style={{ color: '#333333', fontWeight: 500 }}>{meter.name}</span>
                                <br />
                                <span style={{ color: '#9C9C9C' }}>{transSpaceName(meter.spaceName)}</span>
                              </div>
                            </Option>
                          ),
                        )}
                      </OptGroup>
                      <OptGroup label="与回路绑定设备">
                        {(maxtropyMeterOptions.filter(item => item.bind).sort(descByCreatetime) as Meter[]).map(
                          meter => (
                            <Option value={meter.id} key={meter.id} title={meter.name}>
                              <div>
                                <span style={{ color: '#333333', fontWeight: 500 }}>{meter.name}</span>
                                <br />
                                <span style={{ color: '#9C9C9C' }}>{transSpaceName(meter.spaceName)}</span>
                              </div>
                            </Option>
                          ),
                        )}
                      </OptGroup>
                      <OptGroup label="无采集设备">
                        <Option value={NO_METER} key={NO_METER} title="无采集设备">
                          <div>
                            <span style={{ color: '#333333', fontWeight: 500 }}>无采集设备</span>
                          </div>
                        </Option>
                      </OptGroup>
                    </Select>,
                  )}
                </Form>
                <Form className="circuit-form-item">
                  {fieldDecorators.select({
                    fieldName: 'spaceId',
                    label: '所属空间',
                    rules: [
                      {
                        required: true,
                        message: '请选择',
                      },
                    ],
                  })(
                    <Select
                      placeholder="请选择"
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.title && `${option.props.title}`.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {this.state.namePathOptions.map((item, index) => (
                        <Option key={index} value={item.spaceId} title={item.spaceName}>
                          {transSpaceName(item.spaceName)}
                        </Option>
                      ))}
                    </Select>,
                  )}
                </Form>
              </Fragment>
            )}
          </div>
        </Spin>
      </div>
    );
  }
}
