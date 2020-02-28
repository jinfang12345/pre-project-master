import React, { CSSProperties, FunctionComponent } from 'react';
import icon from '../../assets/icon-exclamation-orange.svg';

export interface IconProps {
  src: string;
  width: string | number;
  // 不写就跟width一样
  height?: string;
  style?: CSSProperties;
}

const Icon: FunctionComponent<IconProps> = (props: IconProps) => (
  <i
    style={{
      display: 'inline-block',
      width: props.width,
      height: props.height || props.width,
      backgroundImage: `url(${props.src})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundPosition: 'center center',
      ...props.style,
    }}
  />
);

export default Icon;

export const ExclamationIcon: React.FC<{ style?: CSSProperties }> = props => (
  <Icon src={icon} width={20} style={props.style} />
);
