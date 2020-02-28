import { Ability } from 'Components/Preview';

export interface AbilityGroup {
  name: string;
  children: Ability[];
}

export const ElectricAblities: AbilityGroup[] = [
  {
    name: '一次接线图',
    children: [
      {
        order: 0,
        name: 'DIAGRAM',
        description: '一次接线图',
        preview: require('../../assets/preview/一次接线图.svg'),
        previewDescription: '',
      },
    ],
  },
  {
    name: '数据清洗',
    children: [
      {
        order: 1,
        name: 'DATA_RESAMPLING',
        description: '数据重采样',
        preview: require('../../assets/preview/数据重采样.svg'),
        previewDescription: '数据按时间对齐重采样。',
      },
      {
        order: 2,
        name: 'OUTLIER_CLEANING',
        description: '异常值清洗',
        preview: require('../../assets/preview/异常值清洗.svg'),
        previewDescription: '去除掉采集异常值。',
      },
    ],
  },
  {
    name: '数据统计',
    children: [
      {
        order: 3,
        name: 'MAXIMUM_VALUE_STATISTICS',
        description: '最值统计',
        preview: require('../../assets/preview/最值统计.svg'),
        previewDescription: '统计一段时间内的最大值和最小值。',
      },
      {
        order: 4,
        name: 'AVERAGE_STATISTICS',
        description: '平均值统计',
        preview: require('../../assets/preview/平均值统计.svg'),
        previewDescription: '统计一段时间内的平均值。',
      },
      {
        order: 5,
        name: 'MEDIAN_STATISTICS',
        description: '中位数统计',
        preview: require('../../assets/preview/中位数统计.svg'),
        previewDescription: '统计一段时间内数据的中位数。',
      },
      {
        order: 6,
        name: 'DAY_MONTH_YEAR_ON_YEAR',
        description: '日/月同比环比',
        preview: require('../../assets/preview/日月同比环比.svg'),
        previewDescription: '用于描述统计数据的变化情况。',
      },
    ],
  },
  {
    name: '能效评估',
    children: [
      {
        order: 9,
        name: 'LOAD_RATE_INDEX',
        description: '负载率指数',
        preview: require('../../assets/preview/负载率指数.svg'),
        previewDescription: '根据上月轻重载时长，统计负载率指数。',
      },
      {
        order: 10,
        name: 'PEAK_TO_VALLEY_RATIO_INDEX',
        description: '峰谷比指数',
        preview: require('../../assets/preview/峰谷比指数.svg'),
        previewDescription: '峰电量和谷电量两者计算出峰谷比。',
      },
      {
        order: 11,
        name: 'AVERAGE_PRICE',
        description: '度电均价',
        preview: require('../../assets/preview/度电均价.svg'),
        previewDescription: '由总电费与总电量换算而得。 ',
      },
      {
        order: 12,
        name: 'UNIT_ENERGY_CONSUMPTION',
        description: '单位能耗',
        preview: require('../../assets/preview/单位能耗.svg'),
        previewDescription: '例如，可由单位时间能耗转换成单位产量能耗  ',
      },
    ],
  },
  {
    name: '安全评估',
    children: [
      {
        order: 13,
        name: 'ALARM_STATISTICS_INDEX',
        description: '报警统计指数',
        preview: require('../../assets/preview/报警统计指数.svg'),
        previewDescription: '由上个自然月报警数换算而得的指数。 ',
      },
      {
        order: 14,
        name: 'LINE_TEMPERATURE_INDEX',
        description: '线路温度指数',
        preview: require('../../assets/preview/线路温度指数.svg'),
        previewDescription: '由上月线缆温度超标的持续时间换算而得。',
      },
      {
        order: 15,
        name: 'RESIDUAL_CURRENT_INDEX',
        description: '剩余电流指数',
        preview: require('../../assets/preview/剩余电流指数.svg'),
        previewDescription: '由上月剩余电流存在时长换算而得。',
      },
      {
        order: 16,
        name: 'VOLTAGE_IMBALANCE_INDEX',
        description: '电压不平衡度指数',
        preview: require('../../assets/preview/电压不平衡度指数.svg'),
        previewDescription: '由上月电压不平衡度时长换算而得。',
      },
      {
        order: 17,
        name: 'VOLTAGE_PASS_RATE_INDEX',
        description: '电压合格率指数',
        preview: require('../../assets/preview/电压合格率指数.svg'),
        previewDescription: '由上月电压合格与否的时长换算而得。',
      },
      {
        order: 18,
        name: 'CURRENT_IMBALANCE_INDEX',
        description: '电流不平衡度指数',
        preview: require('../../assets/preview/电流不平衡度指数.svg'),
        previewDescription: '由上月电流不平衡度时长换算而得。',
      },
    ],
  },
  {
    name: '需量管理',
    children: [
      {
        order: 7,
        name: 'DEMAND_FORECAST',
        description: '需量预测',
        preview: require('../../assets/preview/需量预测.svg'),
        previewDescription: '由前两月数据预测出下月最大需量数值。',
      },
      {
        order: 8,
        name: 'REPORTING_ADVICE',
        description: '报装申报建议',
        preview: require('../../assets/preview/报装申报建议.svg'),
        previewDescription: '根据现有数据提供申报建议。',
      },
    ],
  },
  {
    name: '损耗统计',
    children: [
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
    ],
  },
  {
    name: 'AI分析报告',
    children: [
      {
        order: 19,
        name: 'AI_ANALYSIS_REPORT',
        description: 'AI分析报告',
        preview: require('../../assets/preview/AI分析报告.svg'),
        previewDescription: '多维度展现用能情况的综合报告。',
      },
    ],
  },
];

export const OtherAbilities = ElectricAblities.filter(i => i.name === '数据清洗' || i.name === '数据统计');
