import React, { Fragment, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Input, Select, Switch, Popconfirm, message, Modal, Icon, Tooltip } from 'antd';
import { Links } from 'Breadcrumb';
import { ProjectRouteProps } from '../Project';
import {
  deleteLoss,
  generateLabelListWithDefault,
  getLoss,
  getProjectOverView,
  Loss,
  lossAutoCreate,
  LossType,
  LossTypeLabel,
  Monitor,
  MonitorForm,
  MonitorPositionType,
  PagedRequest,
  PagedResponse,
  updateLoss,
} from '@maxtropy/kingfisher-api';
import { FilterPane } from '../../Components/ListPage/FilterPane';
import './index.less';
import { ColumnDefinition } from '@maxtropy/table';
import { createPagedTable, PagedTableHandle } from '../../Components/PagedTable';
import CustomIcon, { ExclamationIcon } from 'Components/Icon';
import { ModalFuncProps } from 'antd/lib/modal';
import { useHasMeasurements } from 'lib/hooks';

const Search = Input.Search;
const Option = Select.Option;
const PagedTable = createPagedTable<Loss>();

const confirmPromise = (props: ModalFuncProps) => {
  return new Promise<boolean>(
    (resolve): void => {
      Modal.confirm({
        ...props,
        onOk: () => {
          resolve(true);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    },
  );
};

const lossTypeOptions = generateLabelListWithDefault(
  LossTypeLabel,
  [LossType.TOTAL_LOSS, LossType.TRANSFORMER_LOSS, LossType.CIRCUIT_LOSS],
  '全部损耗',
);

function renderMonitors(monitors?: Monitor[]): string {
  return monitors && monitors.length > 0 ? monitors.map(m => m.name).join('，') : '--';
}

function columns(
  status: (data: any, record: Loss) => ReactElement,
  actions: (data: any, record: Loss) => ReactElement | null,
): ColumnDefinition<Loss>[] {
  return [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      flex: 1.5,
      render: (data): string => (data ? LossTypeLabel[data as string] : '--'),
    },
    {
      title: (
        <Fragment>
          起始计量点
          <Tooltip title="可选若干回路，该回路电量总和作为损耗起始计算量（损耗计算被减数）">
            <Icon style={{ color: '#CCCCCC', marginLeft: 4 }} type="question-circle" theme="filled" />
          </Tooltip>
        </Fragment>
      ),
      dataIndex: 'startMonitors',
      render: data => renderMonitors(data as Monitor[]),
    },
    {
      title: (
        <Fragment>
          终止计量点
          <Tooltip title="可选若干回路，该回路电量总和作为损耗终止计算量（损耗计算减数）">
            <Icon style={{ color: '#CCCCCC', marginLeft: 4 }} type="question-circle" theme="filled" />
          </Tooltip>
        </Fragment>
      ),
      dataIndex: 'endMonitors',
      render: data => renderMonitors(data as Monitor[]),
    },
    {
      title: (
        <Fragment>
          生成方式
          <Tooltip title="使用系统生成按钮时，所有标记为系统生成的损耗对象将被系统删除，人工添加的损耗对象不受影响。">
            <Icon style={{ color: '#CCCCCC', marginLeft: 4 }} type="question-circle" theme="filled" />
          </Tooltip>
        </Fragment>
      ),
      flex: '120px',
      render: status,
    },
    {
      title: '操作',
      flex: '140px',
      render: actions,
    },
  ];
}

const LossStatus: React.FunctionComponent<{ record: Loss; doSwitch?: () => Promise<void> }> = (
  props,
): React.ReactElement => {
  const { record, doSwitch } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(!record.auto);

  function asyncDoSwitch(): void {
    setLoading(true);
    setChecked(!checked);
    (doSwitch ? doSwitch() : Promise.resolve())
      .then(() => setLoading(false))
      .catch(() => {
        setLoading(false);
        setChecked(checked);
      });
  }

  return (
    <Fragment>
      <Switch size="small" checked={checked} loading={loading} onClick={asyncDoSwitch} />
      &ensp;{checked ? '人工添加' : '系统生成'}
    </Fragment>
  );
};

const LossList: React.FunctionComponent<ProjectRouteProps> = (props): React.ReactElement => {
  const projectId = +props.match.params.projectId;
  const toLossAdd = () => (props as ProjectRouteProps).history.push(Links.LossAdd(projectId));
  const [lossType, setLossType] = useState<LossType | ''>('');
  const [search, setSearch] = useState<string>('');
  const [needUpdate, setNeedUpdate] = useState<boolean>(false);
  const hasMeasurements = useHasMeasurements(projectId);

  useEffect(() => {
    getProjectOverView(projectId).then(overview => setNeedUpdate(!!overview.lossNeedUpdate));
  }, [projectId]);

  const tableRef = useRef<PagedTableHandle>(null);

  const deleteItem = useCallback(
    async (record: Loss): Promise<void> => {
      if (record.id) {
        await deleteLoss(record.id);
        tableRef.current && tableRef.current.update();
      }
    },
    [tableRef],
  );

  const autoGenerate = useCallback(async (): Promise<void> => {
    const confirmed = await confirmPromise({
      content: '是否删除已有自动生成损耗且生成新的损耗',
    });
    if (!confirmed) return;
    const created = await lossAutoCreate(projectId);
    if (!created.length) {
      message.warn('自动生成损耗对象0个！请手动添加');
    }
    tableRef.current && tableRef.current.update();
    setNeedUpdate(false);
  }, [projectId, tableRef]);

  const request = useCallback(
    async (pageInfo: PagedRequest): Promise<PagedResponse<Loss>> => {
      return await getLoss({
        ...pageInfo,
        projectId,
        lossType: lossType || undefined,
        lossName: search,
      });
    },
    [search, lossType, projectId],
  );

  const switchLossAuto = useCallback((record: Loss) => {
    const recordId = record.id;
    if (!recordId) return;
    return async (): Promise<void> => {
      const start: MonitorForm[] =
        (record.startMonitors &&
          record.startMonitors.map(a => ({
            id: a.id,
            type: a.type,
            position: MonitorPositionType.START,
          }))) ||
        [];
      const end: MonitorForm[] =
        (record.endMonitors &&
          record.endMonitors.map(a => ({
            id: a.id,
            type: a.type,
            position: MonitorPositionType.END,
          }))) ||
        [];
      await updateLoss(recordId, {
        name: record.name,
        type: record.type,
        monitors: start.concat(end),
        auto: !record.auto,
      });
    };
  }, []);

  return (
    <div className="page-loss-list">
      <div className="head-extend">
        <FilterPane>
          <Search placeholder="请输入名称" onSearch={value => setSearch(value)} style={{ width: 280 }} />
          <Select
            value={lossType}
            style={{ marginLeft: 10, width: 130 }}
            onChange={(val: LossType | '') => setLossType(val)}
          >
            {lossTypeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <div className="actions">
            {(needUpdate || hasMeasurements === false) && (
              <div className="info-need-update">
                <ExclamationIcon />
                &ensp;
                {(hasMeasurements === false && '请先添加计费进线再添加损耗对象') ||
                  (needUpdate && '回路信息更新，建议更新损耗对象信息')}
                &emsp;
              </div>
            )}
            <Button style={{ marginRight: 10 }} onClick={autoGenerate} disabled={!hasMeasurements}>
              系统生成
            </Button>
            <Button type="primary" onClick={toLossAdd} disabled={!hasMeasurements}>
              人工添加
            </Button>
          </div>
        </FilterPane>
        <PagedTable
          ref={tableRef}
          request={request}
          rowKey={record => record.id as string}
          pageName="aliiot_loss_list"
          columns={columns(
            (columnData, record): ReactElement => (
              <LossStatus record={record} doSwitch={switchLossAuto(record)} />
            ),
            (columnData, record): ReactElement | null => {
              if (!record.id) return null;
              let lossId = record.id;
              return (
                <Fragment>
                  <Button type="link" onClick={() => props.history.push(Links.LossEdit([projectId, lossId]))}>
                    编辑
                  </Button>
                  <Button type="link" onClick={() => props.history.push(Links.LossDetail([projectId, lossId]))}>
                    查看
                  </Button>
                  <Popconfirm title="正在删除损耗对象，是否继续删除？" onConfirm={() => deleteItem(record)}>
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
    </div>
  );
};

export default LossList;
