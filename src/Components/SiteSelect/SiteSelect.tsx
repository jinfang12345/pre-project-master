import React, { FunctionComponent, Fragment, useState, useCallback } from 'react';
import { Site } from '@maxtropy/kingfisher-api';
import { RadioTab, RadioTabOption } from '../RadioTab';
import { Button } from 'antd';
import SiteModal from '../SiteModal';
import { ButtonProps } from 'antd/lib/button';

export interface SiteSelectProps {
  projectId: number;
  currSite: Site | null | undefined;
  siteOptions: RadioTabOption<string>[];
  setSiteId: (siteId: string) => void;
  siteCreated: (newSite: Site) => void;
}

export interface ButtonAddSiteProps {
  projectId: number;
  buttonProps?: ButtonProps;
  onSiteCreated?: (site: Site) => void;
}

export const ButtonAddSite: React.FC<ButtonAddSiteProps> = props => {
  const { onSiteCreated } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const openModal = useCallback(() => setVisible(true), []);
  const onClose = useCallback(
    (updated: boolean, newSite: Site | undefined) => {
      setVisible(false);
      if (updated && newSite) {
        onSiteCreated && onSiteCreated(newSite);
      }
    },
    [onSiteCreated],
  );
  return (
    <Fragment>
      <Button {...props.buttonProps} onClick={openModal}>
        {props.children}
      </Button>
      <SiteModal projectId={props.projectId} visible={visible} onClose={onClose} />
    </Fragment>
  );
};

export const SiteSelect: FunctionComponent<SiteSelectProps> = props => {
  const { currSite, siteOptions, setSiteId, siteCreated } = props;

  return (
    <Fragment>
      <RadioTab options={siteOptions} value={(currSite && currSite.id) || undefined} onChange={setSiteId} />
      <ButtonAddSite
        projectId={props.projectId}
        buttonProps={{ style: { transform: 'translateY(-45px)' } }}
        onSiteCreated={siteCreated}
      >
        添加监测组
      </ButtonAddSite>
    </Fragment>
  );
};
