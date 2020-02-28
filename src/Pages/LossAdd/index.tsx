import React, { ReactNode } from 'react';
import { Button, Col, Icon, Input, message, Row, Spin, Tag, Tree } from 'antd';
import { Links } from 'Breadcrumb';
import EnhancedForm from '@maxtropy/form';
import {
  addLoss,
  DiagramType,
  getCircuitTree,
  getLoss,
  Loss,
  LossForm,
  Monitor,
  MonitorPositionType,
  TreeNode as ResTreeNode,
  updateLoss,
} from '@maxtropy/kingfisher-api';
import AddLostForm, { LossAddFormValue } from './components/LossAddForm';
import FormAbilityPage from '../../Components/FormAbilityPage';
import Drawer from '../../Components/Drawer';
import { LossAbility } from './config';
import './index.less';
import AbilityList from '../../Components/AbilityList';
import { RouteComponentProps } from 'react-router';
import { MAX_INT } from 'lib/const';

const Fragment = React.Fragment;
const { TreeNode } = Tree;
const { Search } = Input;
const MAX_TAG_SHOW_COUNT = 30;
let treeStartPreChoose: string[] = [];
let treeSEndPreChoose: string[] = [];
export type LossAddProps = RouteComponentProps<{
  projectId?: string;
  lossId?: string;
}>;
interface LossDetailType extends LossAddFormValue {
  startMonitors: string[] | undefined;
  endMonitors: string[] | undefined;
}

interface LossAddState {
  drawerVisible: boolean;
  drawerTitle: DrawerTitle;
  drawerType: MonitorPositionType;
  treeStart: string[];
  treeEnd: string[];
  treeData: ResTreeNode[];
  treeSelecting: string[];
  startErr: displayType;
  endErr: displayType;
  loading: boolean;
  searchValue: string;
  autoExpandParent: boolean;
  expandedKeys: string[];
  leftTagExpand: boolean;
  rightTagExpand: boolean;
}
enum displayType {
  show = 'inline',
  hide = 'none',
}
enum DrawerTitle {
  start = '选择起始计量点',
  end = '选择终止计量点',
}
interface RequestParamsType {
  projectId: number;
  size: number;
}

export function transTreeData(treeData: any) {
  if (!Array.isArray(treeData)) {
    return treeData;
  }
  for (let index = 0; index < treeData.length; index++) {
    let node = treeData[index];
    // 添加value字段
    node.value = node.key;
    if (Array.isArray(node.children)) {
      // 替换children 数据
      node.children = transTreeData(node.children);
    }
    // 替换节点数据
    treeData[index] = node;
  }
  return treeData;
}
export function treeFilter(parentIndex: number[] | undefined | boolean, dataSource: ResTreeNode[]): ResTreeNode[] {
  if (typeof parentIndex === 'undefined' || typeof parentIndex === 'boolean') {
    return dataSource;
  } else {
    return dataSource.filter((item, index) => (parentIndex as number[]).includes(index));
  }
}
export function getMonitorType(key: string): DiagramType | undefined {
  const regUniverse = /^p[0-9]+u[0-9]+$/;
  const regCircuit = /^p[0-9]+c[0-9]+$/;
  const regMeasurement = /^p[0-9]+m[0-9]+$/;
  if (regUniverse.test(key)) return DiagramType.UNIVERSAL;
  else if (regCircuit.test(key)) return DiagramType.CIRCUIT;
  else if (regMeasurement.test(key)) return DiagramType.MEASUREMENT;
  else return undefined;
}
// 根据树选择值获取它的父节点Index
export function findParentIndex(dataSource: any, targetKey: string | undefined): number | boolean {
  if (!Array.isArray(dataSource)) {
    return false;
  }
  for (let index = 0; index < dataSource.length; index++) {
    let node = dataSource[index];
    if (node.key === targetKey) return index;
    else if (Array.isArray(node.children)) {
      let result = findParentIndex(node.children, targetKey);
      if (result !== false) {
        return index;
      }
    }
  }
  return false;
}
export default class LossAdd extends React.Component<LossAddProps, LossAddState> {
  formRef: React.RefObject<EnhancedForm<LossAddFormValue>>;
  treeDataAll: ResTreeNode[];
  formDefaultValue: LossAddFormValue;
  isEdit: boolean;
  lossAuto: boolean;
  dataList: ResTreeNode[];
  constructor(props: LossAddProps) {
    super(props);
    this.formRef = React.createRef<EnhancedForm<LossAddFormValue>>();
    this.treeDataAll = [];
    this.isEdit = false;
    this.lossAuto = false;
    this.dataList = [];
    this.formDefaultValue = {
      name: '',
      type: undefined,
    };
    this.state = {
      drawerVisible: false,
      drawerTitle: DrawerTitle.start,
      drawerType: MonitorPositionType.START,
      treeStart: [],
      treeEnd: [],
      treeData: [], // 从接口获取treeData数据
      treeSelecting: [],
      startErr: displayType.hide,
      endErr: displayType.hide,
      searchValue: '',
      loading: false,
      autoExpandParent: true,
      expandedKeys: [],
      leftTagExpand: false,
      rightTagExpand: false,
    };
  }
  init = (): void => {
    const url = document.location.toString();
    this.isEdit = url.includes('edit');
  };
  // 抽屉取消
  closeDrawer = () => {
    switch (this.state.drawerType) {
      case MonitorPositionType.START:
        let parentStartIndex = undefined;
        if (!(treeStartPreChoose.length || this.state.treeEnd.length)) {
          parentStartIndex = findParentIndex(this.treeDataAll, undefined);
        } else {
          parentStartIndex = findParentIndex(
            this.treeDataAll,
            treeStartPreChoose.length ? treeStartPreChoose[0] : this.state.treeEnd[0],
          );
        }
        this.setState({
          drawerVisible: false,
          searchValue: '',
          treeStart: treeStartPreChoose,
          treeData: treeFilter(typeof parentStartIndex === 'number' ? [parentStartIndex] : undefined, this.treeDataAll),
        });
        break;
      case MonitorPositionType.END:
        let parentIndex = undefined;
        if (!(treeSEndPreChoose.length || this.state.treeStart.length)) {
          parentIndex = findParentIndex(this.treeDataAll, undefined);
        } else {
          parentIndex = findParentIndex(
            this.treeDataAll,
            treeSEndPreChoose.length ? treeSEndPreChoose[0] : this.state.treeStart[0],
          );
        }
        this.setState({
          drawerVisible: false,
          searchValue: '',
          treeEnd: treeSEndPreChoose,
          treeData: treeFilter(typeof parentIndex === 'number' ? [parentIndex] : undefined, this.treeDataAll),
        });
        break;
    }
  };
  renderTagList = (data: string[], monitorType: MonitorPositionType): ReactNode | null => {
    let showAll = false;
    switch (monitorType) {
      case MonitorPositionType.START: {
        showAll = this.state.leftTagExpand;
        break;
      }
      case MonitorPositionType.END: {
        showAll = this.state.rightTagExpand;
        break;
      }
    }
    return (
      <Fragment>
        {data.map(
          (item, index) =>
            item && (
              <Tag
                key={index}
                style={{ display: showAll || index < MAX_TAG_SHOW_COUNT ? 'inline-block' : 'none' }}
                closable
                onClose={(e: any) => {
                  e.preventDefault();
                  this.tagChange(item, monitorType);
                }}
              >
                {this.getNodeLabel(item)}
              </Tag>
            ),
        )}
      </Fragment>
    );
  };
  getNodeLabel = (id: string): string => {
    let targetGroup: ResTreeNode | undefined = { title: '', key: '' };
    let result = '';
    for (let index = 0; index < this.treeDataAll.length; index++) {
      if (this.treeDataAll[index].key === id) {
        result = (this.treeDataAll[index].title as string) || '';
      } else {
        let nodeChildren = this.treeDataAll[index].children;
        if (nodeChildren && nodeChildren.length) {
          targetGroup = this.getTargetGroup(nodeChildren, id);
          if (targetGroup) {
            result = targetGroup.title as string;
          }
        }
      }
    }
    return result;
  };
  getTargetGroup = (data: ResTreeNode[], targetGroupId: string): undefined | ResTreeNode => {
    let result = undefined;
    if (!data) {
      return result;
    }
    for (let i in data) {
      if (result != null) {
        break;
      }
      let item = data[i];
      if (item.key === targetGroupId) {
        result = item;
        break;
      } else if (item.children && item.children.length > 0) {
        result = this.getTargetGroup(item.children, targetGroupId);
      }
    }
    return result;
  };
  tagChange = (item: string, monitorType: MonitorPositionType): void => {
    switch (monitorType) {
      case MonitorPositionType.START: {
        this.setState(
          {
            treeStart: this.state.treeStart.filter((val: string) => val != item),
            drawerType: MonitorPositionType.START,
          },
          () => {
            let filterIndex = this.getFilterIndex(this.state.treeStart);
            this.setState({
              treeData: treeFilter(typeof filterIndex === 'number' ? [filterIndex] : undefined, this.treeDataAll),
            });
          },
        );
        break;
      }
      case MonitorPositionType.END: {
        this.setState(
          {
            treeEnd: this.state.treeEnd.filter((val: string) => val != item),
            drawerType: MonitorPositionType.END,
          },
          () => {
            let filterIndex = this.getFilterIndex(this.state.treeStart);
            this.setState({
              treeData: treeFilter(typeof filterIndex === 'number' ? [filterIndex] : undefined, this.treeDataAll),
            });
          },
        );
        break;
      }
    }
  };
  showDrawerStart = (): void => {
    this.setState({
      drawerVisible: true,
      drawerType: MonitorPositionType.START,
      drawerTitle: DrawerTitle.start,
      treeSelecting: this.state.treeStart,
    });
    treeStartPreChoose = this.state.treeStart;
  };
  showDrawerEnd = (): void => {
    this.setState({
      drawerVisible: true,
      drawerType: MonitorPositionType.END,
      drawerTitle: DrawerTitle.end,
      treeSelecting: this.state.treeEnd,
    });
    treeSEndPreChoose = this.state.treeEnd;
  };
  confirmDrawer = (): void => {
    const valueArr = [];
    for (let index = 0; index < this.state.treeSelecting.length; index++) {
      valueArr.push(findParentIndex(this.treeDataAll, this.state.treeSelecting[index]));
    }
    let arrEqual = this.arrAllEqual(valueArr);
    if (!arrEqual) {
      message.error('所选监测点必须在同一计费进线上');
      return;
    } else {
      switch (this.state.drawerType) {
        case MonitorPositionType.START:
          this.setState({
            treeStart: this.state.treeSelecting,
            drawerVisible: false,
            searchValue: '',
            startErr: this.state.treeSelecting.length ? displayType.hide : displayType.show,
          });
          break;
        case MonitorPositionType.END:
          this.setState({
            treeEnd: this.state.treeSelecting,
            drawerVisible: false,
            searchValue: '',
            endErr: this.state.treeSelecting.length ? displayType.hide : displayType.show,
          });
          break;
      }
    }
  };
  arrAllEqual = (arr: any[]): boolean => {
    if (arr.length) {
      return !arr.some((item: false | number) => item !== arr[0]);
    } else {
      return true;
    }
  };
  // 校验起始与终止监测点是否输入
  validateMonitorEmpty = (): boolean => {
    if (this.state.treeStart.length && this.state.treeEnd.length) return true;
    else return false;
  };

  filterLossById = (dataSource: Loss[], lossId: string) => {
    return dataSource.filter(item => item.id === lossId);
  };
  transLossDetail = (params: Loss): LossDetailType => {
    return {
      name: params.name || '',
      type: params.type,
      startMonitors: this.transMonitor(params.startMonitors),
      endMonitors: this.transMonitor(params.endMonitors),
    };
  };
  transMonitor = (params: Monitor[] | undefined): string[] => {
    if (params === undefined) return [];
    return params.map(item => item.id);
  };
  buttonSava = (): void => {
    // 校验起始和终止监测点
    const { treeStart, treeEnd } = this.state;
    const { projectId, lossId } = this.props.match.params;
    const validateMonitorEmpty: boolean = this.validateMonitorEmpty();
    if (this.formRef.current && validateMonitorEmpty) {
      const { error, value } = this.formRef.current && this.formRef.current.validaFieldsAndScroll();
      if (!error) {
        const monitorStartArr = treeStart.map((item, index) => {
          return { position: MonitorPositionType.START, id: item, type: getMonitorType(item || '') };
        });
        const monitorEndArr = treeEnd.map((item, index) => {
          return { position: MonitorPositionType.END, id: item, type: getMonitorType(item || '') };
        });
        const MonitorValue: LossForm = {
          name: value.name,
          type: value.type,
          monitors: monitorStartArr.concat(monitorEndArr),
        };
        if (this.isEdit) {
          updateLoss(lossId || '', MonitorValue)
            .then(() => {
              message.success('损耗对象编辑成功!', 1, () => {
                this.props.history.push(Links.LossList(this.props.match.params.projectId as string));
              });
            })
            .catch(error => {
              console.error(error);
              message.error('提交信息失败，请重试！', 1);
            });
        } else {
          addLoss(MonitorValue)
            .then(() => {
              message.success('损耗对象创建成功!', 1, () => {
                this.props.history.push(Links.LossList(this.props.match.params.projectId as string));
              });
            })
            .catch(error => {
              console.error(error);
              message.error('提交信息失败，请重试！', 1);
            });
        }
      } else {
        console.log('表单错误');
      }
    } else {
      this.setState({
        startErr: treeStart.length ? displayType.hide : displayType.show,
        endErr: treeEnd.length ? displayType.hide : displayType.show,
      });
    }
  };
  buttonCancel = (): void => {
    this.props.history.push(Links.LossList(this.props.match.params.projectId as string));
  };
  // 选中树结构时
  onTreeChange = (value: any): void => {
    switch (this.state.drawerType) {
      case MonitorPositionType.START: {
        this.setState(
          {
            treeStart: value.checked,
            treeSelecting: value.checked,
          },
          () => {
            let filterIndex = this.getFilterIndex(value.checked);
            this.setState({
              treeData: treeFilter(typeof filterIndex === 'number' ? [filterIndex] : undefined, this.treeDataAll),
            });
          },
        );
        break;
      }
      case MonitorPositionType.END: {
        this.setState(
          {
            treeEnd: value.checked,
            treeSelecting: value.checked,
          },
          () => {
            let filterIndex = this.getFilterIndex(value.checked);
            this.setState({
              treeData: treeFilter(typeof filterIndex === 'number' ? [filterIndex] : undefined, this.treeDataAll),
            });
          },
        );
        break;
      }
    }
  };
  getFilterIndex = (value: any): number | undefined | boolean => {
    let result = undefined;
    if (value.length) {
      result = findParentIndex(this.treeDataAll, value[0]);
    } else {
      // 如果当前树没有值被选中，且当前起始、终止监测点都没有值，所有树均可选
      if (!(this.state.treeStart.length || this.state.treeEnd.length)) {
        result = undefined;
      } else {
        result = findParentIndex(
          this.treeDataAll,
          this.state.treeStart.length ? this.state.treeStart[0] : this.state.treeEnd[0],
        );
      }
    }
    return result;
  };
  getParentKey = (key: string, tree: ResTreeNode[]): string | undefined => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };
  inputSearch = (e: any) => {
    const { value } = e.target;
    const expandedKeys = this.dataList
      .map(item => {
        if (item.title && item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key as string, this.treeDataAll);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    const filterParentIndex = new Set<number>();
    expandedKeys.forEach(item => {
      const index = item && findParentIndex(this.treeDataAll, item);
      if (typeof index === 'number') {
        item && filterParentIndex.add(index);
      }
    });
    this.setState({
      treeData: treeFilter(Array.from(filterParentIndex), this.treeDataAll),
      expandedKeys: expandedKeys as string[],
      searchValue: value,
      autoExpandParent: true,
    });
  };
  onExpand = (expandedKeys: any) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };
  generateList = (data: any) => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i];
      const { key, title } = node;
      this.dataList.push({ key, title });
      if (node.children) {
        this.generateList(node.children);
      }
    }
  };
  // 点击控制展开与收起
  startTagToggle = (): void => {
    this.setState({
      leftTagExpand: !this.state.leftTagExpand,
    });
  };
  endTagToggle = (): void => {
    this.setState({
      rightTagExpand: !this.state.rightTagExpand,
    });
  };
  async componentDidMount() {
    this.init();
    this.setState({
      loading: true,
    });
    const { projectId, lossId } = this.props.match.params;
    try {
      this.treeDataAll = await getCircuitTree(Number(this.props.match.params.projectId));
      this.generateList(this.treeDataAll);
      this.setState({
        treeData: this.treeDataAll,
      });
      if (this.isEdit) {
        const requestDetailParams: RequestParamsType = {
          projectId: Number(projectId),
          size: MAX_INT,
        };
        const responseLossDetail = await getLoss(requestDetailParams);
        const targetLossDetail = this.filterLossById(responseLossDetail.content, lossId || '');
        this.lossAuto = targetLossDetail[0].auto || true;
        const newLossDetail = this.transLossDetail(targetLossDetail[0]);
        this.formDefaultValue = {
          name: newLossDetail.name,
          type: newLossDetail.type,
        };
        const selectedParentIndex = findParentIndex(
          this.treeDataAll,
          newLossDetail.startMonitors && newLossDetail.startMonitors[0],
        );
        const filterTreeData = treeFilter(
          typeof selectedParentIndex === 'number' ? [selectedParentIndex] : undefined,
          this.treeDataAll,
        );
        this.setState({
          treeStart: newLossDetail.startMonitors || [],
          treeEnd: newLossDetail.endMonitors || [],
          treeData: filterTreeData,
          leftTagExpand: !((newLossDetail.startMonitors || []).length > MAX_TAG_SHOW_COUNT),
          rightTagExpand: !((newLossDetail.endMonitors || []).length > MAX_TAG_SHOW_COUNT),
        });
      }
      this.setState({
        loading: false,
      });
    } catch (error) {
      console.error(error);
    }
  }
  render() {
    const { drawerType, treeStart, treeEnd, searchValue, autoExpandParent, expandedKeys } = this.state;
    const selectedTreeVal = this.state.drawerType === MonitorPositionType.START ? treeStart : treeEnd;
    const renderTreeNodes = (data: any) =>
      data.map((item: any) => {
        if (item.children) {
          return (
            <TreeNode title={item.title} key={item.key} dataRef={item}>
              {renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode {...item} />;
      });
    const loop = (data: ResTreeNode[]) =>
      data.map(item => {
        const index = (item.title as string).indexOf(this.state.searchValue);
        const beforeStr = item.title ? (item.title as string).substr(0, index) : '';
        const afterStr = item.title ? (item.title as string).substr(index + searchValue.length) : '';
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span style={{ color: '#f50' }}>{searchValue}</span>
              {afterStr}
            </span>
          ) : (
            <span>{item.title}</span>
          );
        if (item.children) {
          return (
            <TreeNode key={item.key} title={title}>
              {loop(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.key} title={title} />;
      });
    return (
      <FormAbilityPage
        buttonArr={[
          { text: '提交', type: 'primary', click: this.buttonSava },
          { text: '取消', click: this.buttonCancel },
        ]}
      >
        <div className="c-loss-add">
          <Spin spinning={this.state.loading}>
            <EnhancedForm
              ref={this.formRef}
              defaultValue={this.formDefaultValue}
              editing={true}
              render={renderProps => <AddLostForm defaultValue={this.formDefaultValue} {...renderProps} />}
            />
            <Row>
              <Col span={10}>
                起始监测点：
                <br />
                <Button onClick={this.showDrawerStart} style={{ marginTop: 7, marginBottom: 9 }}>
                  点击选择
                </Button>
                <span style={{ color: 'red', marginLeft: 7, display: this.state.startErr }}>起始计量点不能为空</span>
                <div>
                  <div>{this.renderTagList(this.state.treeStart, MonitorPositionType.START)}</div>
                  <div
                    className="expand-control"
                    onClick={this.startTagToggle}
                    style={{ display: treeStart.length > MAX_TAG_SHOW_COUNT ? 'block' : 'none' }}
                  >
                    <span>{this.state.leftTagExpand ? '收起' : '展开'}</span>
                    <Icon type={this.state.leftTagExpand ? 'up' : 'down'} />
                  </div>
                </div>
              </Col>
              <Col span={10} offset={3}>
                终止监测点：
                <br />
                <Button onClick={this.showDrawerEnd} style={{ marginTop: 7, marginBottom: 9 }}>
                  点击选择
                </Button>
                <span style={{ color: 'red', marginLeft: 7, display: this.state.endErr }}>终止计量点不能为空</span>
                <div>
                  <div>{this.renderTagList(this.state.treeEnd, MonitorPositionType.END)}</div>
                  <div
                    className="expand-control"
                    onClick={this.endTagToggle}
                    style={{ display: treeEnd.length > MAX_TAG_SHOW_COUNT ? 'block' : 'none' }}
                  >
                    <span>{this.state.rightTagExpand ? '收起' : '展开'}</span>
                    <Icon type={this.state.rightTagExpand ? 'up' : 'down'} />
                  </div>
                </div>
              </Col>
            </Row>
            <Drawer
              visible={this.state.drawerVisible}
              title={this.state.drawerTitle}
              onClose={this.closeDrawer}
              onConfirm={this.confirmDrawer}
              width={550}
              type={drawerType}
            >
              <Search
                style={{ marginBottom: 8 }}
                value={this.state.searchValue}
                placeholder="请输入名称"
                onChange={this.inputSearch}
              />
              {(this.state.treeData.length && (
                <Tree
                  checkable
                  onExpand={this.onExpand}
                  onCheck={this.onTreeChange}
                  autoExpandParent={autoExpandParent}
                  expandedKeys={expandedKeys}
                  checkedKeys={selectedTreeVal}
                  checkStrictly
                >
                  {loop(this.state.treeData)}
                </Tree>
              )) || <span style={{ color: 'rgba(0,0,0,0.25)' }}>无匹配结果</span>}
            </Drawer>
          </Spin>
        </div>
        <div>
          <AbilityList title="配置该损耗对象后可使用服务模型：" all={LossAbility} current={LossAbility} />
        </div>
      </FormAbilityPage>
    );
  }
}
