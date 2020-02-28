import React from 'react';
import { Col, Form, Input, Row } from 'antd';
import { RenderProps } from '@maxtropy/form';
import { CHN_NAME_REGEXP } from 'lib/util';

export interface SiteFormValue {
  id?: string;
  name: string;
  description: string;
}
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
export default class SiteFormContent extends React.Component<RenderProps<SiteFormValue>> {
  render() {
    const { fieldDecorators } = this.props.form;

    return (
      <div>
        <Row>
          <Col span={16} offset={4}>
            <Form {...formItemLayout}>
              {fieldDecorators.input({
                fieldName: 'name',
                label: '监测组名称',
                rules: [
                  {
                    required: true,
                    message: '监测组名称不能为空',
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
              {fieldDecorators.input({
                fieldName: 'description',
                label: '备注',
                rules: [
                  {
                    max: 50,
                    message: '输入不得超过50个字符',
                  },
                ],
              })(<Input.TextArea placeholder="请输入备注" />)}
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}
