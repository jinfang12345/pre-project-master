import React from 'react';
import { Popover } from 'antd';
import { PopoverProps } from 'antd/lib/popover';
import { AliIotServiceCapability } from '@maxtropy/kingfisher-api';
import './index.less';

export interface Ability extends AliIotServiceCapability {
  preview: string;
  previewDescription: string;
}

export const hasAbility = (ability: AliIotServiceCapability, abilityList?: AliIotServiceCapability[]): boolean =>
  Array.isArray(abilityList) && abilityList.map(i => i.order).includes(ability.order);

interface PreviewProps extends PopoverProps {
  ability: Ability;
}
const Preview: React.FC<PreviewProps> = props => {
  const { ability } = props;
  return (
    <Popover
      {...props}
      title={ability.description}
      overlayClassName="c-preview"
      content={
        <div className="preview-content">
          <img src={ability.preview} />
          <span>{ability.previewDescription}</span>
        </div>
      }
    >
      {props.children}
    </Popover>
  );
};

export default Preview;
