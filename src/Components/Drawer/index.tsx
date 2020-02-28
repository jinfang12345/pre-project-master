import React from 'react';
import { Drawer, Button } from 'antd';
import './index.less';
interface CommonDrawerProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  width: number;
  type: string;
}
export default class CommonDrawer extends React.Component<CommonDrawerProps> {
  render() {
    const { title, width } = this.props;
    return (
      <Drawer
        title={title}
        visible={this.props.visible}
        onClose={this.props.onClose}
        width={width}
        maskClosable={false}
        className="c-loss-drawer"
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, overflow: 'auto' }}>{this.props.children}</div>
          <div
            style={{
              width: '100%',
              padding: '10px 16px',
              textAlign: 'right',
              // height: 53,
              borderTop: '1px solid #e9c9c9',
            }}
          >
            <Button style={{ marginRight: 8 }} onClick={this.props.onClose}>
              取消
            </Button>
            <Button type="primary" onClick={this.props.onConfirm}>
              确定
            </Button>
          </div>
        </div>
      </Drawer>
    );
  }
}
