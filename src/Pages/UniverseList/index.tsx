import React, { ReactElement, Fragment, useCallback, useState } from 'react';
import { Links } from 'Breadcrumb';
import { ColumnDefinition } from '@maxtropy/table';
import {
  UniversalCircuitTypeLabel,
  PagedRequest,
  PagedResponse,
  aliIotGetUniversalCircuits,
  AliIotUniversalCircuitDetail,
  Meter,
  aliIotDeleteUniversalCircuit,
  Site,
} from '@maxtropy/kingfisher-api';
import { Button, Icon, Input, Popconfirm } from 'antd';
import { ProjectRouteProps } from '../Project';
import { createPagedTable, PagedTableHandle } from 'Components/PagedTable';
import { FilterPane } from 'Components/ListPage/FilterPane';
import './index.less';
import { useSiteSelect } from 'Components/SiteSelect/useSiteSelect';
import { ButtonAddSite, SiteSelect } from 'Components/SiteSelect/SiteSelect';
import SiteDelete from 'Components/SiteDelete';
import SiteEdit from 'Components/SiteEdit';
import { ExclamationIcon } from 'Components/Icon';

const Search = Input.Search;
const PagedTable = createPagedTable<AliIotUniversalCircuitDetail>();

function columns(
  actions: (data: any, record: AliIotUniversalCircuitDetail) => ReactElement | null,
): ColumnDefinition<AliIotUniversalCircuitDetail>[] {
  return [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (data): string => (data ? UniversalCircuitTypeLabel[data as string] : '--'),
    },
    {
      title: '采集设备',
      dataIndex: 'meter',
      render: (data): string => (data && (data as Meter).name) || '--',
    },
    {
      title: '所属空间',
      dataIndex: 'spaceName',
      render: (data): string => (data ? `${data}` : '--'),
    },
    {
      title: '操作',
      flex: '140px',
      render: actions,
    },
  ];
}

const UniverseList: React.FunctionComponent<ProjectRouteProps> = (props): React.ReactElement => {
  const projectId = +props.match.params.projectId;
  const [search, setSearch] = useState<string>('');
  const [currSite, siteOptions, setSiteId, siteCreated, refresh] = useSiteSelect(projectId);
  const tableRef = React.createRef<PagedTableHandle>();

  const deleteItem = async (record: AliIotUniversalCircuitDetail): Promise<void> => {
    if (record.id) {
      await aliIotDeleteUniversalCircuit(record.id);
      tableRef.current && tableRef.current.update();
    }
  };

  const request = useCallback(
    async (pageInfo: PagedRequest): Promise<PagedResponse<AliIotUniversalCircuitDetail> | undefined> => {
      if (!currSite) {
        return;
      }
      return await aliIotGetUniversalCircuits({
        projectId,
        name: search,
        siteId: currSite && currSite.id,
        ...pageInfo,
      });
    },
    [currSite, projectId, search],
  );

  return (
    <div className="page-universal-list">
      <div className="head-extend">
        <SiteSelect
          currSite={currSite}
          siteOptions={siteOptions}
          setSiteId={setSiteId}
          siteCreated={siteCreated}
          projectId={projectId}
        />
      </div>
      <div className="page">
        {currSite && (
          <div className="page-content">
            <dl className="site-info">
              <div>
                <dt>监测组名称：</dt>
                <dd>{currSite && currSite.name}</dd>
                <dt>备注：</dt>
                <dd>{currSite && currSite.description}</dd>
              </div>
              <div>
                {!currSite ? (
                  <div className="info">
                    <ExclamationIcon />
                    &ensp;请先添加监测组再添加监测点
                  </div>
                ) : null}
                <SiteDelete site={currSite} onClose={refresh} />
                &ensp;
                <SiteEdit projectId={projectId} site={currSite} onClose={refresh} />
                &ensp;
                <Button
                  type="primary"
                  disabled={!currSite}
                  onClick={() => props.history.push(Links.UniverseAdd([projectId, (currSite as Site).id as string]))}
                >
                  添加监测点
                </Button>
              </div>
            </dl>
            <FilterPane>
              <Search placeholder="请输入名称" onSearch={value => setSearch(value)} style={{ width: 280 }} />
            </FilterPane>
            <PagedTable
              ref={tableRef}
              request={request}
              pageName="aliiot_universal_list"
              columns={columns(
                (columnData, record): ReactElement | null => {
                  if (!record.id) return null;
                  let universeId = record.id;
                  return (
                    <Fragment>
                      <Button
                        type="link"
                        onClick={() =>
                          props.history.push(
                            Links.UniverseEdit([projectId, (currSite as Site).id as string, universeId]),
                          )
                        }
                      >
                        编辑
                      </Button>
                      <Button
                        type="link"
                        onClick={() =>
                          props.history.push(
                            Links.UniverseDetail([projectId, (currSite as Site).id as string, universeId]),
                          )
                        }
                      >
                        查看
                      </Button>
                      <Popconfirm title="正在删除监测点，是否继续删除？" onConfirm={() => deleteItem(record)}>
                        <Button type="link">删除</Button>
                      </Popconfirm>
                    </Fragment>
                  );
                },
              )}
              renderEmpty={() => (
                <div>
                  <Icon type="info-circle" theme="filled" style={{ color: '#ccc' }} />
                  &ensp;暂无任何数据
                </div>
              )}
            />
          </div>
        )}
        {currSite === null && (
          <div className="page-content">
            <div className="empty">
              <div>
                <Icon type="info-circle" theme="filled" style={{ color: '#ccc' }} />
                &ensp;暂无任何数据&emsp;|&emsp;
                <ButtonAddSite projectId={projectId} onSiteCreated={siteCreated} buttonProps={{ type: 'link' }}>
                  添加监测组
                </ButtonAddSite>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniverseList;
