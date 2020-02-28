import React, { Fragment } from 'react';
import { Button, Popconfirm } from 'antd';
import { Site, deleteSite } from '@maxtropy/kingfisher-api';

interface SiteDeleteProps {
  site?: Site | null;
  onClose: () => void;
}

const SiteDelete: React.FC<SiteDeleteProps> = props => {
  const confirmDeleteSite = async () => {
    if (props.site && props.site.id) {
      await deleteSite(props.site.id);
      props.onClose();
    }
    return;
  };
  return props.site ? (
    <Popconfirm
      title={
        <Fragment>
          正在删除监测组：{props.site.name}，<br />
          该监测组下所有回路/监测点将全部删除，是否继续删除？
        </Fragment>
      }
      onConfirm={confirmDeleteSite}
    >
      <Button>删除</Button>
    </Popconfirm>
  ) : null;
};

export default SiteDelete;
