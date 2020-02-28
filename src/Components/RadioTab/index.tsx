import React, { ReactElement } from 'react';
import { Tabs } from 'antd';
import './index.less';

const TabPane = Tabs.TabPane;

const valueMap = new WeakMap<any, string>();
let nextKey = 1;
function getUniqueKey(val: any): string {
  if (typeof val !== 'function' && (typeof val !== 'object' || val === null)) {
    return `${val}`;
  }
  const ekey = valueMap.get(val);
  if (ekey) {
    return ekey;
  } else {
    const nkey = (nextKey++).toString(36);
    valueMap.set(val, nkey);
    return nkey;
  }
}

export interface RadioTabOption<V> {
  label: string;
  value: V;
}

export interface RadioTabProps<V> {
  options: RadioTabOption<V>[];
  value?: V;
  onChange?: (val: V) => void;
}

export function RadioTab<V>(props: RadioTabProps<V>): ReactElement {
  return (
    <Tabs
      className="c-radio-tab"
      activeKey={props.value && getUniqueKey(props.value)}
      onChange={key => {
        if (props.onChange) {
          const option = props.options.find(o => getUniqueKey(o.value) === key);
          option && props.onChange(option.value);
        }
      }}
    >
      {props.options.map(option => (
        <TabPane key={getUniqueKey(option.value)} tab={option.label} />
      ))}
    </Tabs>
  );
}
