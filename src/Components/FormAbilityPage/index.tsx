import React from 'react';
import { Col, Row, Button, Divider } from 'antd';
import './index.less';

interface ButtonType {
  text: string;
  type?: string;
  click?: () => void;
}
interface FormAbilityPageProps {
  buttonHandle?(parmas: object): void;
  buttonArr?: ButtonType[];
}
export default class FormAbilityPage extends React.Component<FormAbilityPageProps> {
  render() {
    return (
      <Row className="page-page-container">
        <Col span={18} className="container-left">
          <Row>
            <div className="label">基本信息</div>
            <div>{this.props.children && this.props.children[0]}</div>
          </Row>
          <Divider />
          <Row className="button-area">
            <div>
              {this.props.buttonArr &&
                this.props.buttonArr.map((item, index) => (
                  <Button
                    key={index}
                    style={{ marginRight: 8 }}
                    type={item.type ? 'primary' : undefined}
                    onClick={item.click}
                  >
                    {item.text}
                  </Button>
                ))}
            </div>
          </Row>
        </Col>
        <Col className="container-right">{this.props.children && this.props.children[1]}</Col>
      </Row>
    );
  }
}
