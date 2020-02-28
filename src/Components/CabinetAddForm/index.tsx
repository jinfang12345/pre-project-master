import React from 'react';
import { Col, Form, Input, Row } from 'antd';
import { RenderProps } from '@maxtropy/form';
import { CHN_NAME_REGEXP } from 'lib/util';

export interface InputValue {
  name?: string;
}
interface InputPropsType extends RenderProps<InputValue> {
  handleCancel?(): void;
}
export default class CabinetAddForm extends React.Component<InputPropsType> {
  render() {
    const { fieldDecorators } = this.props.form;
    return (
      <div>
        <Row>
          <Col span={16} offset={4}>
            <Form>
              {fieldDecorators.input({
                fieldName: 'name',
                label: '配电柜名称',
                rules: [
                  {
                    required: true,
                    message: '配电柜名称不能为空',
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
        </Row>
      </div>
    );
  }
}
