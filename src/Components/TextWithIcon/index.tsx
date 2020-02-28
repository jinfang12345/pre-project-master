import React from 'react';
import { Icon, Tooltip } from 'antd';
import './index.less';

interface TextWithIconpProps {
  text: string;
  hasIcon: boolean;
  type: string;
  iconColor: string;
}
export default class TextWithIcon extends React.Component<TextWithIconpProps> {
  state = {
    toolTipShow: false,
  };
  showToolTip = () => {
    this.setState({
      toolTipShow: true,
    });
  };
  hideToolTip = () => {
    this.setState({
      toolTipShow: false,
    });
  };
  render() {
    const { text, hasIcon, type, iconColor } = this.props;
    return (
      <div className="c-text-with-icon">
        <span className="item">
          {hasIcon && <Icon className="iconSpan" type={type} theme="filled" style={{ color: iconColor }} />}
          <span className="text">{text}</span>
        </span>
      </div>
    );
  }
}
