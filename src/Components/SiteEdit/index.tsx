import React, { useState } from 'react';
import { Button } from 'antd';
import { Site } from '@maxtropy/kingfisher-api';
import SiteModal from '../SiteModal';

interface SiteEditProps {
  site?: Site | null;
  projectId: number;
  onClose: () => void;
}

const SiteEdit: React.FC<SiteEditProps> = props => {
  const [visible, setVisible] = useState<boolean>(false);
  return (
    <React.Fragment>
      <Button onClick={() => setVisible(true)}>编辑</Button>
      <SiteModal
        projectId={props.projectId}
        visible={visible}
        onClose={() => {
          setVisible(false);
          props.onClose();
        }}
        defaultValue={
          props.site
            ? {
                id: props.site.id,
                name: props.site.name || '',
                description: props.site.description || '',
              }
            : undefined
        }
      />
    </React.Fragment>
  );
};

export default SiteEdit;
