import React from 'react';
import EnhancedForm from '@maxtropy/form';
import SiteFormContent, { SiteFormValue } from './SiteFormContent';
import Modal from '../Modal';
import { createSite, Site, updateSite } from '@maxtropy/kingfisher-api';

export interface SiteModalProps {
  projectId: number;
  visible: boolean;
  onClose: (updated: boolean, newSite?: Site) => void;
  defaultValue?: SiteFormValue;
}

export default class SiteModal extends React.Component<SiteModalProps> {
  formRef: React.RefObject<EnhancedForm<SiteFormValue>>;

  constructor(props: SiteModalProps) {
    super(props);
    this.formRef = React.createRef<EnhancedForm<SiteFormValue>>();
  }

  submit = () => {
    if (this.formRef.current) {
      const { error, value } = this.formRef.current && this.formRef.current.validateFields();
      if (!error) {
        if (this.props.defaultValue && this.props.defaultValue.id) {
          updateSite(this.props.defaultValue.id, {
            projectId: this.props.projectId,
            ...value,
          }).then(site => this.props.onClose(true, site));
        } else {
          createSite({
            projectId: this.props.projectId,
            ...value,
          }).then(site => this.props.onClose(true, site));
        }
      }
    }
  };

  cancel = () => {
    this.props.onClose(false);
  };

  render() {
    const defaultValue: SiteFormValue = this.props.defaultValue || {
      name: '',
      description: '',
    };
    const key = defaultValue.id || Date.now();
    return (
      <Modal title="监测组" visible={this.props.visible} handleOk={this.submit} handleCancel={this.cancel}>
        <EnhancedForm
          ref={this.formRef}
          key={key}
          defaultValue={defaultValue}
          editing={true}
          render={renderProps => <SiteFormContent {...renderProps} />}
        />
      </Modal>
    );
  }
}
