import React, { ReactElement, useCallback, useState } from 'react';
import { Links } from 'Breadcrumb';
import { ColumnDefinition } from '@maxtropy/table';
import { Button, Icon, Input, Popconfirm } from 'antd';
import {
  ElectricBillTypeLabel,
  getMeasurements,
  Measurement,
  PagedRequest,
  PagedResponse,
  VoltageLevelValueLabel,
  deleteMeasurement,
} from '@maxtropy/kingfisher-api';
import { ProjectRouteProps } from '../Project';
import { createPagedTable, PagedTableHandle } from '../../Components/PagedTable';
import { FilterPane } from 'Components/ListPage/FilterPane';
import './index.less';

const { Fragment } = React;
const Search = Input.Search;
const PagedTable = createPagedTable<Measurement>();

function columns(actions: (data: any, record: Measurement) => ReactElement): ColumnDefinition<Measurement>[] {
  return [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '装机容量',
      dataIndex: 'installedCapacity',
      render: (data): string => (data ? data + ' kVA' : '--'),
    },
    {
      title: '电压等级',
      dataIndex: 'voltageLevel',
      render: (data): string => (data ? VoltageLevelValueLabel[data as string] : '--'),
    },
    {
      title: '电价制度',
      dataIndex: 'electricBillType',
      render: (data): string => (data ? ElectricBillTypeLabel[data as string] : '--'),
    },
    {
      title: '是否分时',
      dataIndex: 'jfpgSwitch',
      render: (yes): string => (yes ? '是' : '否'),
    },
    {
      title: '操作',
      flex: '140px',
      render: actions,
    },
  ];
}

const MeasurementList: React.FunctionComponent<ProjectRouteProps> = (props): React.ReactElement => {
  const [search, setSearch] = useState<string>('');
  const projectId = props.match.params.projectId;
  const tableRef = React.createRef<PagedTableHandle>();

  const deleteItem = async (record: Measurement): Promise<void> => {
    if (!record.id) return;
    deleteMeasurement(record.id).then(() => tableRef.current && tableRef.current.update());
  };

  const request = useCallback(
    async (pageInfo: PagedRequest): Promise<PagedResponse<Measurement>> => {
      return await getMeasurements({
        ...pageInfo,
        projectId: parseFloat(projectId),
        name: search,
      });
    },
    [projectId, search],
  );

  return (
    <div className="page-measurement-list">
      <FilterPane>
        <Search placeholder="请输入名称" onSearch={value => setSearch(value)} style={{ width: 280 }} />
        <Button type="primary" onClick={() => props.history.push(Links.MeasurementAdd(projectId))}>
          添加计费进线
        </Button>
      </FilterPane>
      <PagedTable
        ref={tableRef}
        request={request}
        pageName="aliiot_measurement_list"
        columns={columns(
          (columnData, record): ReactElement => (
            <Fragment>
              <Button
                type="link"
                onClick={() => props.history.push(Links.MeasurementEdit([projectId, record.id as string]))}
              >
                编辑
              </Button>
              <Button
                type="link"
                onClick={() => props.history.push(Links.MeasurementDetail([projectId, record.id as string]))}
              >
                查看
              </Button>
              <Popconfirm
                title="正在删除计费进线，删除后将影响服务模型使用，是否继续删除？"
                onConfirm={() => deleteItem(record)}
              >
                <Button type="link">删除</Button>
              </Popconfirm>
            </Fragment>
          ),
        )}
        renderEmpty={() => (
          <div>
            <Icon type="info-circle" theme="filled" style={{ color: '#ccc' }} />
            &ensp;暂无任何数据
            {!search && (
              <Fragment>
                &emsp;|&emsp;
                <Button type="link" onClick={() => props.history.push(Links.MeasurementAdd(projectId))}>
                  添加计费进线
                </Button>
              </Fragment>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default MeasurementList;
