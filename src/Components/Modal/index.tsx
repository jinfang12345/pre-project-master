import React from 'react';
import { Modal } from 'antd';

interface PropsType {
  title: string;
  visible: boolean;
  handleOk: () => void;
  handleCancel: () => void;
}

export default class CustomModal extends React.Component<PropsType> {
  render() {
    const { title } = this.props;
    return (
      <Modal
        title={'添加' + title}
        visible={this.props.visible}
        okText="确定"
        cancelText="取消"
        onCancel={this.props.handleCancel}
        onOk={this.props.handleOk}
        maskClosable={false}
        keyboard={false}
        destroyOnClose
      >
        {this.props.children}
      </Modal>
    );
  }
}
