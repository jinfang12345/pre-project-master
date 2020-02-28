import React, { useEffect } from 'react';
import { Icon, Button } from 'antd';
import './index.less';

interface SlideModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm?: () => void;
  title: string | React.ReactNode;
  contentWidth?: number;
  footer?: React.ReactNode;
}

/**
 * 写到最后才发现antd有drawer组件，但是antd的组件有点问题
 * 1、确定和取消不是组件内置的，要自己写（这倒不是什么大问题）
 * 2、不确定当抽屉的内容超出容器的的时候组件对滚动的处理（由于没试过这个问题，暂时使用自己的组件）
 */
const SlideModal: React.FunctionComponent<SlideModalProps> = props => {
  useEffect(() => {
    if (props.visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [props.visible]);
  return (
    <div className={`c-slide-modal ${props.visible ? 'show' : ''}`}>
      <div className="content-wrapper" style={{ width: props.contentWidth || 1024 }}>
        <div className="title">
          {props.title}
          <div className="close-wrapper" onClick={props.onCancel}>
            <Icon type="close" />
          </div>
        </div>
        <div className="content">{props.visible && props.children}</div>
        <div className="footer">{props.footer}</div>
      </div>
    </div>
  );
};

export default SlideModal;
