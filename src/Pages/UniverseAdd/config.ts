import { Ability } from 'Components/Preview';

export const UniverseAbility: Ability[] = [
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
];
