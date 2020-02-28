import React, { PropsWithChildren, ReactElement } from 'react';

export interface FilterPaneProps {
  className?: string;
}

export function FilterPane(props: PropsWithChildren<FilterPaneProps>): ReactElement {
  if (!props.children) {
    return <div className={props.className} />;
  } else if (Array.isArray(props.children)) {
    return (
      <div
        className={props.className}
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', flex: '1 1 auto', justifyContent: 'flex-start' }}>
          {props.children.slice(0, -1)}
        </div>
        <div style={{ display: 'flex', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          {props.children.length > 0 && props.children[props.children.length - 1]}
        </div>
      </div>
    );
  } else {
    return <div className={props.className}>{props.children}</div>;
  }
}
