import React from 'react';
import { Col, Form, Input, Radio, Row, Select, Spin } from 'antd';
import {
  aliIotGetCapabilityByMeter,
  aliIotGetMeters,
  AliIotServiceCapability,
  DeviceSourceType,
  generateLabelList,
  getSpaceDetail,
  Meter,
  SpaceDetail,
  UniversalCircuitType,
  universalCircuitType2MeterType,
  UniversalCircuitTypeLabel,
} from '@maxtropy/kingfisher-api';
import { RenderProps } from '@maxtropy/form';
import './index.less';
import { descByCreatetime, transSpaceName } from '../../../CircuitAdd/components/CircuitAddForm';
import { RadioChangeEvent } from 'antd/lib/radio';
import { SelectValue } from 'antd/lib/select';
import { CHN_NAME_REGEXP } from 'lib/util';

const Fragment = React.Fragment;
export const NO_METER = 'noMeter';

const { OptGroup } = Select;
export interface UniverseAddFormValue {
  name: string;
  type: number | undefined;
  description: string;
  deviceSource: DeviceSourceType;
  meter?: string;
  spaceId: string | undefined;
}
interface UniverseFormProps extends RenderProps<UniverseAddFormValue> {
  projectId: number;
  universeId?: string;
  circuitId?: string;
  defaultValue: UniverseAddFormValue;
  updateAbilityList: (value: AliIotServiceCapability[]) => void;
}
interface UniverseFormState {
  iotMeterOptions: Meter[];
  maxtropyMeterOptions: Meter[];
  namePathOptions: SpaceDetail[];
  loading: boolean;
}
const Option = Select.Option;
const RadioGroup = Radio.Group;
const UniversalCircuitTypeOptions = generateLabelList(UniversalCircuitTypeLabel, [
  UniversalCircuitType.WATER,
  UniversalCircuitType.GAS,
]);
export function filterMeterOptions(dataSource: Meter[], filterMeterType: number, type: DeviceSourceType): Meter[] {
  return dataSource.filter(item => item.meterType === filterMeterType);
}
export default class UniverseForm extends React.Component<UniverseFormProps, UniverseFormState> {
  isEdit: boolean;
  maxtropyMeterOptionsAll: Meter[];
  iotMeterOptionsAll: Meter[];
  constructor(props: UniverseFormProps) {
    super(props);
    this.isEdit = false;
    this.maxtropyMeterOptionsAll = [];
    this.iotMeterOptionsAll = [];
    this.state = {
      iotMeterOptions: [],
      maxtropyMeterOptions: [],
      namePathOptions: [],
      loading: false,
    };
  }
  onDeviceSourceChange = (e: RadioChangeEvent) => {
    this.props.form.setFieldValue('meter', NO_METER);
    this.props.form.setFieldValue('spaceId', undefined);
    this.props.updateAbilityList([]);
  };
  onTypeChange = (value: SelectValue) => {
    let filterMeterType = universalCircuitType2MeterType(value as UniversalCircuitType);
    const filterMeterOptions = this.maxtropyMeterOptionsAll.filter(item => item.meterType === filterMeterType);
    const filterIotOptions = this.iotMeterOptionsAll.filter(item => item.meterType === filterMeterType);
    this.setState({
      maxtropyMeterOptions: filterMeterOptions,
      iotMeterOptions: filterIotOptions,
    });
  };
  onMeterChange = async (value: SelectValue) => {
    // 调接口获取能力列表
    try {
      if (value.toString() !== NO_METER) {
        const resCapabilityList = await aliIotGetCapabilityByMeter(value as string);
        this.props.updateAbilityList(resCapabilityList);
      } else {
        this.props.updateAbilityList([]);
      }
    } catch (error) {
      console.error(error);
    }
    if (this.props.form.getFieldValue('deviceSource') === DeviceSourceType.ALI_IOT_PLATFORM) {
      const targetMeter = this.state.iotMeterOptions.filter(item => item.id === value);
      if (targetMeter && targetMeter.length && targetMeter[0].spaceId) {
        this.props.form.setFieldValue('spaceId', targetMeter[0].spaceId);
      }
    }
  };
  currIsEdit = (url: string): void => {
    this.isEdit = url.includes('edit');
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
    const { projectId } = this.props;
    this.setState({
      loading: true,
    });
    const [respIotMeterList, responseMaxtList, resSpaceDetail] = await Promise.all([
      aliIotGetMeters({ projectId, deviceSourceType: DeviceSourceType.ALI_IOT_PLATFORM }),
      aliIotGetMeters({ projectId, deviceSourceType: DeviceSourceType.MAXTROPY_PLATFORM }),
      getSpaceDetail(projectId),
    ]);
    this.maxtropyMeterOptionsAll = responseMaxtList;
    this.iotMeterOptionsAll = respIotMeterList;
    this.setState({
      iotMeterOptions: filterMeterOptions(
        respIotMeterList,
        universalCircuitType2MeterType(this.props.form.getFieldValue('type') as UniversalCircuitType),
        DeviceSourceType.ALI_IOT_PLATFORM,
      ),
      maxtropyMeterOptions: filterMeterOptions(
        responseMaxtList,
        universalCircuitType2MeterType(this.props.form.getFieldValue('type') as UniversalCircuitType),
        DeviceSourceType.MAXTROPY_PLATFORM,
      ),
      namePathOptions: resSpaceDetail,
      loading: false,
    });
  }
  componentDidUpdate(
    prevProps: Readonly<UniverseFormProps>,
    prevState: Readonly<UniverseFormState>,
    snapshot?: any,
  ): void {
    if (prevProps.defaultValue !== this.props.defaultValue) {
      this.props.form.setFormValue(this.props.defaultValue);
      this.setState({
        maxtropyMeterOptions: filterMeterOptions(
          this.maxtropyMeterOptionsAll,
          universalCircuitType2MeterType(this.props.form.getFieldValue('type') as UniversalCircuitType),
          DeviceSourceType.MAXTROPY_PLATFORM,
        ),
        iotMeterOptions: filterMeterOptions(
          this.iotMeterOptionsAll,
          universalCircuitType2MeterType(this.props.form.getFieldValue('type') as UniversalCircuitType),
          DeviceSourceType.ALI_IOT_PLATFORM,
        ),
      });
    }
  }
  render() {
    const { fieldDecorators, getFieldValue } = this.props.form;
    const { iotMeterOptions, maxtropyMeterOptions } = this.state;
    const IotSpaceName =
      getFieldValue('deviceSource') === DeviceSourceType.MAXTROPY_PLATFORM ? '' : this.getIotSpaceName();
    return (
      <Spin spinning={this.state.loading}>
        <Row>
          <Col span={10} className="col-style">
            <Form>
              {fieldDecorators.input({
                fieldName: 'name',
                label: '监测点名称',
                rules: [
                  {
                    required: true,
                    message: '监测点名称不能为空',
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
          </Col>
          <Col span={10} offset={3} className="col-style">
            <Form>
              {fieldDecorators.select({
                fieldName: 'type',
                label: '类型',
                rules: [
                  {
                    required: true,
                    message: '请输入类型',
                  },
                ],
              })(
                <Select<UniversalCircuitType>
                  placeholder="请选择类型"
                  disabled={this.isEdit}
                  onChange={this.onTypeChange}
                >
                  {UniversalCircuitTypeOptions.map((item, index) => (
                    <Option value={item.value} key={index}>
                      {item.label}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form>
          </Col>
          <Col span={10} className="col-style">
            <Form>
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
          </Col>
        </Row>
        <div className="label-style" style={{ marginTop: 36 }}>
          数据采集
        </div>
        <div className="col-style">
          <Form>
            {fieldDecorators.radioGroup({
              fieldName: 'deviceSource',
              label: '设备来源',
              rules: [
                {
                  required: true,
                },
              ],
            })(
              <RadioGroup onChange={this.onDeviceSourceChange}>
                <Radio value={DeviceSourceType.ALI_IOT_PLATFORM}>阿里云IoT平台</Radio>
                <Radio value={DeviceSourceType.MAXTROPY_PLATFORM}>极熵平台</Radio>
              </RadioGroup>,
            )}
          </Form>
        </div>
        {getFieldValue('deviceSource') === DeviceSourceType.ALI_IOT_PLATFORM ? (
          <Fragment>
            <Col span={10} className="col-style">
              <Form>
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
                    optionFilterProp="children"
                    onChange={this.onMeterChange}
                    filterOption={(input, option) =>
                      option.props.title && `${option.props.title}`.toLowerCase().includes(input.toLowerCase())
                    }
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
            </Col>
            {getFieldValue('meter') && (
              <Col span={24} className="col-style">
                <p style={{ marginTop: 16 }}>所属空间：</p>
                <p style={{ color: '#000000' }}>{IotSpaceName}</p>
              </Col>
            )}
          </Fragment>
        ) : (
          <Fragment>
            <Col span={10} className="col-style">
              <Form>
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
                    optionFilterProp="children"
                    onChange={this.onMeterChange}
                    filterOption={(input, option) =>
                      option.props.children && `${option.props.children}`.toLowerCase().includes(input.toLowerCase())
                    }
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
                      {(maxtropyMeterOptions.filter(item => item.bind).sort(descByCreatetime) as Meter[]).map(meter => (
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
                        </div>
                      </Option>
                    </OptGroup>
                  </Select>,
                )}
              </Form>
            </Col>
            <Col span={10} offset={3} className="col-style">
              <Form>
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
            </Col>
          </Fragment>
        )}
      </Spin>
    );
  }
}
