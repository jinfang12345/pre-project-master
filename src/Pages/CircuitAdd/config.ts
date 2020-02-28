import { Ability } from 'Components/Preview';

export const CircuitAbility: Ability[] = [
  {
    order: 0,
    description: '一次接线图',
    preview: require('../../assets/preview/一次接线图.svg'),
    previewDescription: '',
  },
  {
    order: 1,
    description: '数据重采样',
    preview: require('../../assets/preview/数据重采样.svg'),
    previewDescription: '数据按时间对齐重采样。',
  },
  {
    order: 2,
    description: '异常值清洗',
    preview: require('../../assets/preview/异常值清洗.svg'),
    previewDescription: '去除掉采集异常值。',
  },
  {
    order: 3,
    description: '最值统计',
    preview: require('../../assets/preview/最值统计.svg'),
    previewDescription: '统计一段时间内的最大值和最小值。',
  },
  {
    order: 4,
    description: '平均值统计',
    preview: require('../../assets/preview/平均值统计.svg'),
    previewDescription: '统计一段时间内的平均值。',
  },
  {
    order: 5,
    description: '中位数统计',
    preview: require('../../assets/preview/中位数统计.svg'),
    previewDescription: '统计一段时间内数据的中位数。',
  },
  {
    order: 6,
    description: '日/月同比环比',
    preview: require('../../assets/preview/日月同比环比.svg'),
    previewDescription: '用于描述统计数据的变化情况。',
  },
  {
    order: 7,
    description: '需量预测',
    preview: require('../../assets/preview/需量预测.svg'),
    previewDescription: '由前两月数据预测出下月最大需量数值。',
  },
  {
    order: 9,
    description: '负载率指数',
    preview: require('../../assets/preview/负载率指数.svg'),
    previewDescription: '根据上月轻重载时长，统计负载率指数。',
  },
  {
    order: 10,
    description: '峰谷比指数',
    preview: require('../../assets/preview/峰谷比指数.svg'),
    previewDescription: '峰电量和谷电量两者计算出峰谷比。',
  },
  {
    order: 11,
    description: '度电均价',
    preview: require('../../assets/preview/度电均价.svg'),
    previewDescription: '由总电费与总电量换算而得。',
  },
  {
    order: 12,
    description: '单位能耗',
    preview: require('../../assets/preview/单位能耗.svg'),
    previewDescription: '例如，可由单位时间能耗转换成单位产量能耗',
  },
  {
    order: 13,
    description: '报警统计指数',
    preview: require('../../assets/preview/报警统计指数.svg'),
    previewDescription: '由上个自然月报警数换算而得的指数。 ',
  },
  {
    order: 14,
    description: '线路温度指数',
    preview: require('../../assets/preview/线路温度指数.svg'),
    previewDescription: '由上月线缆温度超标的持续时间换算而得。',
  },
  {
    order: 15,
    description: '剩余电流指数',
    preview: require('../../assets/preview/剩余电流指数.svg'),
    previewDescription: '由上月剩余电流存在时长换算而得。',
  },
  {
    order: 16,
    description: '电压不平衡度指数',
    preview: require('../../assets/preview/电压不平衡度指数.svg'),
    previewDescription: '由上月电压不平衡度时长换算而得。',
  },
  {
    order: 17,
    description: '电压合格率指数',
    preview: require('../../assets/preview/电压合格率指数.svg'),
    previewDescription: '由上月电压合格与否的时长换算而得。',
  },
  {
    order: 18,
    description: '电流不平衡度指数',
    preview: require('../../assets/preview/电流不平衡度指数.svg'),
    previewDescription: '由上月电流不平衡度时长换算而得。',
  },
  {
    order: 19,
    description: 'AI分析报告',
    preview: require('../../assets/preview/AI分析报告.svg'),
    previewDescription: '多维度展现用能情况的综合报告。',
  },
];
