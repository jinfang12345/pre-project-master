import React, { useState, useCallback } from 'react';
import * as H from 'history';
import { Form, Input, Select, Radio, Card, Icon, Button, message } from 'antd';
import EnhancedForm, { RenderProps } from '@maxtropy/form';
import {
  MeasurementForm,
  Jfpg,
  VoltageLevelValue,
  ElectricBillType,
  generateLabelList,
  VoltageLevelValueLabel,
  JfpgSeasonMode,
  bulkCreateMeasurement,
  bulkUpdateMeasurement,
  getProject,
  getTimesharing,
} from '@maxtropy/kingfisher-api';
import { Links } from 'Breadcrumb';
import { useFetchData } from 'lib/hooks';
import Show from './Jfpg/Show';
import Config, { getDefaultInfoList } from './Jfpg/Config';
import SlideModal from './SlideModal';
import { validNumber, validPrecision } from './rules';
import { CHN_NAME_REGEXP } from 'lib/util';

const Option = Select.Option;
const LinkBtnStyle = { padding: 0, lineHeight: '32px' };
const SubmitBtnStyle = { marginRight: 8 };

const VoltageLevel = generateLabelList(VoltageLevelValueLabel, [
  VoltageLevelValue.L0_4KV,
  VoltageLevelValue.L10KV,
  VoltageLevelValue.L20KV,
  VoltageLevelValue.L35KV,
  VoltageLevelValue.L66KV,
  VoltageLevelValue.L110KV,
  VoltageLevelValue.L220KV,
]);

const ElectricBillOptions = [
  {
    label: '单一制',
    value: ElectricBillType.SINGLE,
  },
  {
    label: '两部制',
    value: ElectricBillType.TWO_PART,
  },
];

const JfpgSwitchOptions = [
  {
    label: '不分时',
    value: false,
  },
  {
    label: '分时',
    value: true,
  },
];

export const getDefaultValue = (): MeasurementForm => ({
  id: undefined,
  name: undefined,
  voltageLevel: VoltageLevelValue.L0_4KV,
  installedCapacity: undefined,
  description: undefined,
  electricBillType: ElectricBillType.TWO_PART,
  jfpgSwitch: true,
  demandPrice: undefined,
  capacityPrice: undefined,
  price: undefined,
  jfpgForm: undefined,
});

const getDefaultJfpgInfoList = () => getDefaultInfoList()[JfpgSeasonMode.FULL_YEAR];
const getDefaultJfpgForm = (): Jfpg => ({
  seasonMode: JfpgSeasonMode.FULL_YEAR,
  jfpgInfoList: getDefaultJfpgInfoList(),
});
const deepCopy = <T extends object>(o: T | undefined): T => (o ? JSON.parse(JSON.stringify(o)) : o);

interface MeasurementFormPropds<MeasurementForm> extends RenderProps<MeasurementForm> {
  history: H.History;
  projectId?: string;
  measurementId?: string;
}

const MeasurementFormComp: React.FunctionComponent<MeasurementFormPropds<MeasurementForm>> = props => {
  const { fieldDecorators, getFieldValue, setFieldValue, getEditing, validateFieldsAndScroll } = props.form;
  const projectId = props.projectId as string;
  const electricBillType = getFieldValue('electricBillType');
  const jfpgSwitch = getFieldValue('jfpgSwitch');
  const jfpgForm = deepCopy(getFieldValue('jfpgForm') as Jfpg);
  const voltageLevel = getFieldValue('voltageLevel') as VoltageLevelValue;
  const jfpgInfoList = jfpgForm ? (jfpgForm as Jfpg).jfpgInfoList || [] : [];
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [shouldUseJfpg, setShouldUseJfpg] = useState(false);
  const [confirmStore, setConfirm] = useState({
    confirm: () => ({ error: false, value: jfpgForm }),
  });
  const [shouldLoadJfpgForm, setShouldLoadJfpgForm] = useState(!props.measurementId);
  useFetchData(async () => {
    if (shouldLoadJfpgForm) {
      const project = await getProject(+projectId);
      const city = project.city as string;
      const res = await getTimesharing({ city, voltageLevel });
      setFieldValue('jfpgForm', res.seasonMode || res.seasonMode === JfpgSeasonMode.FULL_YEAR ? res : undefined);
    }
    return jfpgForm;
  }, [voltageLevel]);
  const confirmJfpgForm = () => {
    const { error, value } = confirmStore.confirm();
    if (!error) {
      setFieldValue('jfpgForm', value);
      setVisible(false);
      setShouldLoadJfpgForm(false);
      setShouldUseJfpg(false);
    }
  };
  const onSubmit = async () => {
    const { error, value } = validateFieldsAndScroll();
    if (!error) {
      if (value.jfpgSwitch && !value.jfpgForm) {
        setShouldUseJfpg(true);
        return;
      } else {
        setShouldUseJfpg(false);
      }
      try {
        setLoading(true);
        if (value.id) {
          await bulkUpdateMeasurement({
            projectId: parseFloat(projectId),
            measurements: [value],
          });
          props.history.push(Links.MeasurementDetail([props.projectId as string, props.measurementId as string]));
        } else {
          await bulkCreateMeasurement({
            projectId: parseFloat(projectId),
            measurements: [value],
          });
          props.history.push(Links.MeasurementList([props.projectId as string]));
        }
      } catch (err) {
        console.log(err);
        message.error('提交信息失败，请重试！');
      } finally {
        setLoading(false);
      }
    }
  };
  const onEdit = () =>
    props.history.push(Links.MeasurementEdit([props.projectId as string, props.measurementId as string]));
  const JfpgSwitchComp = (
    <div className="inline-form">
      电度电价
      {fieldDecorators.radioGroup({
        fieldName: 'jfpgSwitch',
        getDisplayValue: v => `(${(JfpgSwitchOptions.find(i => i.value === v) || { label: '' }).label})`,
        displayStyle: { height: 48, lineHeight: '48px' },
      })(
        <Radio.Group
          className="custom-radio-group"
          onChange={e => !e.target.value && setShouldUseJfpg(false)}
          style={{ marginTop: 4 }}
        >
          {JfpgSwitchOptions.map((i, index) => (
            <Radio key={index} value={i.value}>
              {i.label}
            </Radio>
          ))}
        </Radio.Group>,
      )}
      {jfpgSwitch && getEditing() && jfpgForm && (
        <div>
          <Icon style={{ color: '#CCCCCC', marginRight: 4 }} type="question-circle" theme="filled" />
          {!props.measurementId && '系统已获取到所在省市电价信息，'}如需调整请自行
          <Button style={LinkBtnStyle} type="link" onClick={() => setVisible(true)}>
            配置电价
          </Button>
        </div>
      )}
    </div>
  );
  return (
    <React.Fragment>
      <div className="content">
        <div className="title">基本信息</div>
        <Form>
          <div className="row">
            <div className="left">
              {fieldDecorators.input({
                label: '计费进线名称',
                fieldName: 'name',
                rules: [
                  {
                    required: true,
                    message: '计费进线名称不能为空',
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
            </div>
            <div className="right">
              {fieldDecorators.input({
                label: '装机容量',
                fieldName: 'installedCapacity',
                rules: [
                  {
                    required: true,
                    message: '装机容量不能为空',
                  },
                  {
                    pattern: validNumber,
                    message: '请输入一个正确的数字',
                  },
                  {
                    validator: validPrecision(16),
                    message: '输入数字超过精度范围',
                  },
                ],
                getDisplayValue: v => `${v}kVA`,
              })(<Input placeholder="请输入装机容量" addonAfter="kVA" />)}
            </div>
          </div>
          <div className="row">
            <div className="left">
              {fieldDecorators.select({
                label: '电压等级',
                fieldName: 'voltageLevel',
                rules: [
                  {
                    required: true,
                  },
                ],
                getDisplayValue: v => (VoltageLevel.find(i => i.value === v) || { label: '' }).label,
              })(
                <Select style={{ width: '100%' }}>
                  {VoltageLevel.map(i => (
                    <Option key={i.value} value={i.value}>
                      {i.label}
                    </Option>
                  ))}
                </Select>,
              )}
            </div>
            <div className="right">
              {fieldDecorators.input({
                label: '备注',
                fieldName: 'description',
                rules: [
                  {
                    max: 50,
                    message: '输入不得超过50个字符',
                  },
                ],
                getDisplayValue: v => (v ? (v as string) : '--'),
              })(<Input placeholder="请输入备注" />)}
            </div>
          </div>
          <div className="title" style={{ marginBottom: 16 }}>
            计费信息
          </div>
          <div style={{ marginBottom: 16 }}>
            {fieldDecorators.radioGroup({
              fieldName: 'electricBillType',
              label: '电价制度',
              rules: [
                {
                  required: true,
                },
              ],
              getDisplayValue: v => (ElectricBillOptions.find(i => i.value === v) || { label: '' }).label,
            })(
              <Radio.Group>
                {ElectricBillOptions.map(i => (
                  <Radio key={i.value} value={i.value}>
                    {i.label}
                  </Radio>
                ))}
              </Radio.Group>,
            )}
          </div>
          <Card className={`jfpg-card ${shouldUseJfpg ? 'has-error' : ''}`} type="inner" title={JfpgSwitchComp}>
            {jfpgSwitch ? (
              jfpgInfoList.length ? (
                jfpgInfoList.map((jfpgInfo, index) => (
                  <Show key={index} seasonMode={jfpgForm.seasonMode} jfpgInfo={jfpgInfo} />
                ))
              ) : (
                <div className="empty-info">
                  <span>
                    <Icon style={{ marginRight: 6, color: '#CCCCCC' }} theme="filled" type="info-circle" />
                    无电价信息
                  </span>
                  <span className="divider" />
                  <Button style={LinkBtnStyle} type="link" onClick={() => setVisible(true)}>
                    配置电价
                  </Button>
                </div>
              )
            ) : (
              <div className="row">
                <div className="left">
                  {fieldDecorators.input({
                    fieldName: 'price',
                    label: '电度电价',
                    rules: [
                      {
                        required: true,
                        message: '电价不能为空',
                      },
                      {
                        pattern: validNumber,
                        message: '请输入一个正确的数字',
                      },
                      {
                        validator: validPrecision(6),
                        message: '输入数字超过精度范围',
                      },
                    ],
                    getDisplayValue: v => `${v}元/kWh`,
                  })(<Input placeholder="请输入电价" addonAfter="元/kWh" />)}
                </div>
              </div>
            )}
          </Card>
          <div className="jfpg-error">{shouldUseJfpg ? '请配置电价' : ''}</div>
          {electricBillType === ElectricBillType.TWO_PART && (
            <Card
              className="jfpg-card"
              type="inner"
              title={<div style={{ height: 48, lineHeight: '48px' }}>基本电价</div>}
            >
              <div className="row">
                <div className="left">
                  {fieldDecorators.input({
                    fieldName: 'demandPrice',
                    label: '需量电价',
                    rules: [
                      {
                        required: true,
                        message: '需量电价不能为空',
                      },
                      {
                        pattern: validNumber,
                        message: '请输入一个正确的数字',
                      },
                      {
                        validator: validPrecision(6),
                        message: '输入数字超过精度范围',
                      },
                    ],
                    getDisplayValue: v => `${v}元/kW·月`,
                  })(<Input placeholder="请输入电价" addonAfter="元/kW·月" />)}
                </div>
                <div className="right">
                  {fieldDecorators.input({
                    fieldName: 'capacityPrice',
                    label: '容量电价',
                    rules: [
                      {
                        required: true,
                        message: '容量电价不能为空',
                      },
                      {
                        pattern: validNumber,
                        message: '请输入一个正确的数字',
                      },
                      {
                        validator: validPrecision(6),
                        message: '输入数字超过精度范围',
                      },
                    ],
                    getDisplayValue: v => `${v}元/kVA·月`,
                  })(<Input placeholder="请输入电价" addonAfter="元/kVA·月" />)}
                </div>
              </div>
            </Card>
          )}
        </Form>
      </div>
      <div className="footer">
        {getEditing() ? (
          <Button type="primary" loading={loading} onClick={onSubmit} style={SubmitBtnStyle}>
            提交
          </Button>
        ) : (
          <Button type="primary" onClick={onEdit} style={SubmitBtnStyle}>
            编辑
          </Button>
        )}
        {getEditing() && (
          <Button loading={loading} onClick={props.history.goBack}>
            取消
          </Button>
        )}
      </div>
      <SlideModal
        title="电价信息"
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={
          <React.Fragment>
            <Button type="primary" style={{ marginRight: 8 }} onClick={confirmJfpgForm}>
              确定
            </Button>
            <Button onClick={() => setVisible(false)}>取消</Button>
          </React.Fragment>
        }
      >
        <EnhancedForm
          defaultValue={jfpgForm ? jfpgForm : { ...getDefaultJfpgForm() }}
          editing
          render={props => <Config setConfirm={setConfirm} {...props} />}
        />
      </SlideModal>
    </React.Fragment>
  );
};

export default MeasurementFormComp;
