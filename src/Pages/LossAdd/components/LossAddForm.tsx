import React from 'react';
import { Form, Input, Select, Row, Col } from 'antd';
import { generateLabelList, LossType, LossTypeLabel, Monitor } from '@maxtropy/kingfisher-api';
import { RenderProps } from '@maxtropy/form';
import { CHN_NAME_REGEXP } from 'lib/util';

interface AddLostFormProps extends RenderProps<LossAddFormValue> {
  defaultValue: LossAddFormValue;
}
export interface LossAddFormValue {
  name: string;
  type: LossType | undefined;
}
const Option = Select.Option;
const LossTypeOptions = generateLabelList(LossTypeLabel, [
  LossType.TOTAL_LOSS,
  LossType.TRANSFORMER_LOSS,
  LossType.CIRCUIT_LOSS,
]);
export default class AddLostForm extends React.Component<AddLostFormProps> {
  state = {
    visible: false,
  };
  componentDidUpdate(prevProps: Readonly<AddLostFormProps>, prevState: Readonly<{}>, snapshot?: any): void {
    if (prevProps.defaultValue !== this.props.defaultValue) {
      this.props.form.setFormValue(this.props.defaultValue);
    }
  }
  render() {
    const { fieldDecorators } = this.props.form;
    return (
      <div>
        <Row>
          <Col span={10}>
            <Form>
              {fieldDecorators.input({
                fieldName: 'name',
                label: '损耗名称',
                rules: [
                  {
                    required: true,
                    message: '损耗对象名称不能为空',
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
          <Col offset={3} span={10}>
            <Form>
              {fieldDecorators.select({
                fieldName: 'type',
                label: '类型',
                rules: [
                  {
                    required: true,
                    message: '请选择',
                  },
                ],
              })(
                <Select placeholder="请选择类型">
                  {LossTypeOptions.map((item, index) => (
                    <Option key={index} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}
