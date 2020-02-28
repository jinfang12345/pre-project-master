import React, { CSSProperties } from 'react';
import './index.less';

interface DetailItemProps {
  title: string;
  value: string | number;
  style?: CSSProperties;
}
export default class DetailItem extends React.Component<DetailItemProps> {
  render() {
    const { title, value, style } = this.props;
    return (
      <div className="c-detail-item">
        <span className="item-style">
          <span className="title-style" style={style || {}}>{`${title}`}</span>
          <br />
          <span className="value-style">{value}</span>
        </span>
      </div>
    );
  }
}
