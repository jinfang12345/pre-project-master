import React from 'react';
import { Progress as ProgressBar } from 'antd';
import './index.less';

type ProgressType = 'success' | 'exception' | 'normal';

interface ProgressProps {
  loading: boolean;
  result: ProgressType;
}

const MIN = 0;
const MAX = 100;

const getCurrentType = (props: ProgressProps, current: number): ProgressType => {
  if (props.result === 'exception') {
    return 'exception';
  } else {
    return current < MAX ? 'normal' : props.result;
  }
};

const Progress: React.FC<ProgressProps> = props => {
  const [percent, setPercent] = React.useState(MIN);
  const [end, setEnd] = React.useState(false);
  const shouldStop = React.useRef(false);
  const progressType = React.useRef<ProgressType>('normal');
  const start = (current: number) => {
    if (current >= MAX || progressType.current === 'exception') {
      setTimeout(() => setEnd(true), 1000); // 延时1s才去跳转
    } else {
      const random = shouldStop.current ? current + 1 : Math.random() > 0.8 ? current + 1 : current;
      const next = shouldStop.current ? random : random > 98 ? 98 : random;
      setPercent(next);
      window.requestAnimationFrame(() => start(next));
    }
  };
  React.useEffect(() => {
    if (props.loading) {
      percent === MIN && start(percent);
    } else {
      shouldStop.current = true;
      progressType.current = props.result;
    }
  }, [props.loading]);
  return end ? (
    <React.Fragment>{props.children}</React.Fragment>
  ) : (
    <div className="c-info-page progress">
      <ProgressBar type="circle" percent={percent} status={getCurrentType(props, percent)} />
      <div className="text">
        数据同步中
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
};

export default Progress;
