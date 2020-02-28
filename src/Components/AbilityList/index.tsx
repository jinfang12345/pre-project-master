import React from 'react';
import { Icon, Tooltip } from 'antd';
import Preview, { Ability, hasAbility } from '../Preview';
import { AliIotServiceCapability } from '@maxtropy/kingfisher-api';
import './index.less';

interface AbilitylistProps {
  title: string;
  all: Ability[];
  current: AliIotServiceCapability[];
}

const AbilityList: React.FC<AbilitylistProps> = props => {
  const { title, all, current } = props;
  const have = all.filter(i => hasAbility(i, current));
  const notHave = all.filter(i => !hasAbility(i, current));
  return (
    <div className="c-ability-list">
      <div className="title">{title}</div>
      <div>
        {[...have, ...notHave].map((item, index) => {
          return (
            <div key={item.description}>
              <Preview ability={item} placement="left">
                <span
                  className={`child ${hasAbility(item, have) ? '' : 'not-have'}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    fontSize: 14,
                    cursor: 'default',
                  }}



                >
                  <span>
                    {hasAbility(item, have) ? (
                      <Icon theme="filled" type="check-circle" className="icon" style={{ marginRight: 14 }} />
                    ) : null}
                    <span style={{ marginLeft: hasAbility(item, have) ? 0 : 31 }}>{item.description}</span>
                  </span>
                  <span className="preview-right">
                    <Icon theme="filled" type="eye" style={{ marginRight: 5 }} />
                    <span>预览</span>
                  </span>
                </span>
              </Preview>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AbilityList;
