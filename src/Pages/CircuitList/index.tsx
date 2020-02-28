import React, { ReactElement, Fragment, useCallback, useState, useEffect } from 'react';
import { Links } from 'Breadcrumb';
import { ColumnDefinition } from '@maxtropy/table';
import { Button, Icon, Input, Popconfirm } from 'antd';
import {
  AliIotCircuitDetail,
  aliIotDeleteCircuit,
  aliIotGetCircuits,
  CircuitLike,
  CircuitTypeLabel,
  Site,
  Meter,
  PagedRequest,
  PagedResponse,
} from '@maxtropy/kingfisher-api';
import { ProjectRouteProps } from '../Project';
import { createPagedTable, emptyPagedResponse, PagedTableHandle } from '../../Components/PagedTable';
import { FilterPane } from '../../Components/ListPage/FilterPane';
import './index.less';
import { useSiteSelect } from '../../Components/SiteSelect/useSiteSelect';
import { ButtonAddSite, SiteSelect } from '../../Components/SiteSelect/SiteSelect';
import SiteDelete from 'Components/SiteDelete';
import SiteEdit from 'Components/SiteEdit';
import { circuitIsTie } from 'lib/util';
import { useHasMeasurements } from 'lib/hooks';
import { ExclamationIcon } from 'Components/Icon';

const Search = Input.Search;
const PagedTable = createPagedTable<AliIotCircuitDetail>();

function columns(
  actions: (data: any, record: AliIotCircuitDetail) => ReactElement | null,
): ColumnDefinition<AliIotCircuitDetail>[] {
  return [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (data): string => (data ? CircuitTypeLabel[data as string] : '--'),
    },
    {
      title: '上游回路',
      dataIndex: 'parent',
      render: (data, record): string => {
        if (record.type) {
          if (circuitIsTie(record.type)) {
            return [record.left, record.right]
              .filter((x): x is CircuitLike => !!x)
              .map(x => x.name)
              .filter((x): x is string => !!x)
              .join('，');
          } else {
            return (record.parent && record.parent.name) || '--';
          }
        } else {
          return '--';
        }
      },
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

const CircuitList: React.FunctionComponent<ProjectRouteProps> = (props): React.ReactElement => {
  const [search, setSearch] = useState<string>('');
  const projectId = +props.match.params.projectId;
  const hasMeasurement = useHasMeasurements(projectId);
  const [currSite, siteOptions, setSiteId, siteCreated, refresh] = useSiteSelect(projectId);
  const tableRef = React.createRef<PagedTableHandle>();

  const deleteItem = async (record: AliIotCircuitDetail): Promise<void> => {
    if (!record.id) return;
    aliIotDeleteCircuit(record.id).then(() => tableRef.current && tableRef.current.update());
  };

  const request = useCallback(
    async (pageInfo: PagedRequest): Promise<PagedResponse<AliIotCircuitDetail> | undefined> => {
      if (!currSite) {
        return emptyPagedResponse();
      }
      return await aliIotGetCircuits({
        projectId,
        name: search,
        siteId: currSite && currSite.id,
        ...pageInfo,
      });
    },
    [currSite, projectId, search],
  );

  return (
    <div className="page-circuit-list">
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
                    &ensp;请先添加监测组再添加回路
                  </div>
                ) : hasMeasurement === false ? (
                  <div className="info">
                    <ExclamationIcon />
                    &ensp;请先添加计费进线再添加回路
                  </div>
                ) : null}
                <SiteDelete site={currSite} onClose={refresh} />
                &ensp;
                <SiteEdit projectId={projectId} site={currSite} onClose={refresh} />
                &ensp;
                <Button
                  type="primary"
                  disabled={!currSite || !hasMeasurement}
                  onClick={() => props.history.push(Links.CircuitAdd([projectId, (currSite as Site).id as string]))}
                >
                  添加回路
                </Button>
              </div>
            </dl>
            <FilterPane>
              <Search placeholder="请输入名称" onSearch={value => setSearch(value)} style={{ width: 280 }} />
            </FilterPane>
            <PagedTable
              ref={tableRef}
              request={request}
              pageName="aliiot_circuit_list"
              columns={columns(
                (columnData, record): ReactElement | null => {
                  if (!record.id) return null;
                  if (!currSite) return null;
                  let circuitId = record.id;
                  return (
                    <Fragment>
                      <Button
                        type="link"
                        onClick={() =>
                          props.history.push(Links.CircuitEdit([projectId, currSite.id as string, circuitId]))
                        }
                      >
                        编辑
                      </Button>
                      <Button
                        type="link"
                        onClick={() =>
                          props.history.push(Links.CircuitDetail([projectId, currSite.id as string, circuitId]))
                        }
                      >
                        查看
                      </Button>
                      <Popconfirm title="正在删除回路，是否继续删除？" onConfirm={() => deleteItem(record)}>
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

export default CircuitList;
