export enum Words {
  project = 'project',
  config = 'config',
  add = 'add',
  edit = 'edit',
  detail = 'detail',
  projectId = '/:projectId',
  siteId = '/:siteId',
  circuitId = '/:circuitId',
  universeId = '/:universeId',
  lossId = '/:lossId',
  list = 'list',
  measurement = 'measurement',
  measurementId = '/:measurementId',
  circuit = 'circuit',
  loss = 'loss',
  universe = 'universe',
}

type EN_CN = Map<Words, string>;

export const WordsMap: EN_CN = new Map([
  [Words.project, '项目'],
  [Words.config, '配置'],
  [Words.add, '添加'],
  [Words.edit, '编辑'],
  [Words.detail, '详情'],
  [Words.list, '列表'],
  [Words.measurement, '计费进线'],
  [Words.circuit, '回路'],
  [Words.loss, '损耗对象'],
  [Words.universe, '监测点'], // 通用监测点回路
]);
