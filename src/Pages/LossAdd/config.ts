import { Ability } from 'Components/Preview';

export const LossAbility: Ability[] = [
  {
    order: 20,
    name: 'LOSS_DATA',
    description: '损耗数据',
    preview: require('../../assets/preview/损耗数据.svg'),
    previewDescription: '统计一段时间内的损耗数值。',
  },
  {
    order: 21,
    name: 'LOSS_EVALUATION',
    description: '损耗评估',
    preview: require('../../assets/preview/损耗评估.svg'),
    previewDescription: '提供损耗量、损耗率评估排名。',
  },
];
