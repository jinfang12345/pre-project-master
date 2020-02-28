import React, { useState, useEffect } from 'react';
import { Checkbox, Radio, Tooltip, Icon, Input } from 'antd';
import {
  generateLabelList,
  JfpgPriceLabel,
  JfpgType,
  JfpgPriceType,
  JfpgInfo,
  DayTimeRange,
} from '@maxtropy/kingfisher-api';
import { RenderProps } from '@maxtropy/form';
import { dayTiemRangeToFmtStr } from './Show';
import { sortTimeRange, MAX_LENGTH, ONE_YEAR, MonthMap } from './Config';
import { validNumber, validPrecision } from '../rules';
import './Info.less';

interface JfpgInfoProps extends RenderProps<JfpgInfo> {
  showChangeSeasonMonth: boolean;
  jfpgInfoList: JfpgInfo[];
  showError: boolean;
  onSeasonMonthChange: (months: number[], description: string) => void;
}

interface TimeRangeItem {
  title: string;
  detail: DayTimeRange;
  value: number;
}

const JfpgTypeList = [JfpgType.JIAN, JfpgType.FENG, JfpgType.PING, JfpgType.GU];

const JfpgPriceList = generateLabelList(JfpgPriceLabel, [
  JfpgPriceType.JIAN,
  JfpgPriceType.FENG,
  JfpgPriceType.PING,
  JfpgPriceType.GU,
]);

const DayTimeRanges: TimeRangeItem[] = Array.from({ length: 48 }, (_, i) => i).map(i => {
  const fromMinute = i * 30;
  const toMinute = (i + 1) * 30;
  return {
    value: i,
    title: dayTiemRangeToFmtStr({ fromMinute, toMinute }),
    detail: {
      fromMinute,
      toMinute,
    },
  };
});

// a 和 b 存在交集
const hasIntersection = (a: DayTimeRange, b: DayTimeRange): boolean => {
  return (
    (a.fromMinute >= b.fromMinute && a.fromMinute <= b.toMinute) ||
    (a.toMinute <= b.toMinute && a.toMinute >= b.fromMinute) ||
    (b.fromMinute >= a.fromMinute && b.fromMinute <= a.toMinute) ||
    (b.toMinute <= a.toMinute && b.toMinute >= a.fromMinute)
  );
};
// a 是 b 的子集
const isChildren = (a: DayTimeRange, b: DayTimeRange): boolean =>
  a.fromMinute >= b.fromMinute && a.toMinute <= b.toMinute;
// a 和 b 求差集
const difference = (a: DayTimeRange, b: DayTimeRange): DayTimeRange[] => {
  if (hasIntersection(a, b)) {
    let result: DayTimeRange[] = [];
    if (b.fromMinute >= a.fromMinute && b.fromMinute <= a.toMinute) {
      if (b.fromMinute !== a.fromMinute) {
        result.push({
          fromMinute: a.fromMinute,
          toMinute: b.fromMinute,
        });
      }
    }
    if (b.toMinute >= a.fromMinute && b.toMinute <= a.toMinute) {
      if (b.toMinute !== a.toMinute) {
        result.push({
          fromMinute: b.toMinute,
          toMinute: a.toMinute,
        });
      }
    }
    return result;
  } else {
    return [a];
  }
};
// 对当前选中的进行合并
const mergeTimeRange = (current: DayTimeRange[], selected: DayTimeRange): DayTimeRange[] => {
  let result = current;
  /**
   * 如果 selected 和 current 每一项都没有交集，则直接作并集
   * 如果 selected 是 current 中某一项的子集，则不做更改
   * 如果 selected 和 current 中的某些项有交集，则需要对这些有交集的项求并集
   */
  if (current.every(i => i.toMinute < selected.fromMinute || i.fromMinute > selected.toMinute)) {
    result = result.concat(selected);
  } else if (current.some(i => isChildren(selected, i))) {
    result = result;
  } else {
    let intersections = current.filter(i => hasIntersection(i, selected)).concat(selected);
    let others = current.filter(i => !hasIntersection(i, selected));
    result = others.concat({
      fromMinute: Math.min(...intersections.map(i => i.fromMinute)),
      toMinute: Math.max(...intersections.map(i => i.toMinute)),
    });
  }
  return result.sort(sortTimeRange);
};
// 对其他类型进行求差
const differenceRange = (current: DayTimeRange[], selected: DayTimeRange): DayTimeRange[] => {
  /**
   * 如果 selected 和 current 每一项都没有交集，则直接返回
   * 如果 selected 和 current 中的某些项有交集，则需要对这些有交集的项求差集
   */
  if (current.every(i => i.toMinute < selected.fromMinute || i.fromMinute > selected.toMinute)) {
    return current;
  } else {
    let intersections = current.filter(i => hasIntersection(i, selected));
    let others = current.filter(i => !hasIntersection(i, selected));
    return others.concat(intersections.map(i => difference(i, selected)).flat()).sort(sortTimeRange);
  }
};

const Info: React.FunctionComponent<JfpgInfoProps> = props => {
  const { showChangeSeasonMonth, jfpgInfoList, showError, onSeasonMonthChange } = props;
  const { fieldDecorators, getFieldValue, setFieldValue, validateFieldsAndScroll } = props.form;
  const defaultJfpgType = JfpgType.JIAN;
  const [jfpgType, setJfpgType] = useState(defaultJfpgType);
  const [currentClick, setCurrentClick] = useState(-1);
  const [currentHover, setCurrentHover] = useState(-1);

  useEffect(() => {
    if (showError) {
      validateFieldsAndScroll();
    }
  }, [showError]);

  const onRangeClick = (value: number) => {
    if (currentClick === -1) {
      setCurrentClick(value);
      setCurrentHover(value);
    } else {
      const [clickStart, clickEnd] = [currentClick, value].sort((a, b) => a - b);
      const selected = DayTimeRanges.filter(i => i.value >= clickStart && i.value <= clickEnd).map(i => i.detail);
      const newRange: DayTimeRange = {
        fromMinute: Math.min(...selected.map(i => i.fromMinute)),
        toMinute: Math.max(...selected.map(i => i.toMinute)),
      };
      setFieldValue(jfpgType, mergeTimeRange((getFieldValue(jfpgType) || []) as DayTimeRange[], newRange));
      JfpgTypeList.filter(type => type !== jfpgType).forEach(type => {
        setFieldValue(type, differenceRange(getFieldValue(type || []) as DayTimeRange[], newRange));
      });
      setCurrentClick(-1);
      setCurrentHover(-1);
    }
  };

  const onHoverChange = (value: number) => {
    if (currentClick === -1 || value === currentHover) {
      return;
    }
    setCurrentHover(value);
  };

  const getClassName = (range: TimeRangeItem): string => {
    let selectedClassName = '';
    for (let type of JfpgTypeList) {
      if (((getFieldValue(type) || []) as DayTimeRange[]).some(j => isChildren(range.detail, j))) {
        selectedClassName = `selected ${type}`;
      }
    }
    if (currentClick === -1 || currentHover === -1) {
      return selectedClassName;
    } else {
      const [hoverStart, hoverEnd] = [currentClick, currentHover].sort((a, b) => a - b);
      return range.value >= hoverStart && range.value <= hoverEnd ? `hover ${jfpgType}` : selectedClassName;
    }
  };

  return (
    <div className="tab-pane">
      {showChangeSeasonMonth && (
        <Checkbox.Group
          className="month-group"
          value={getFieldValue('months') as number[]}
          onChange={v => {
            setFieldValue('months', (v as number[]).sort((a, b) => a - b));
            onSeasonMonthChange(v as number[], getFieldValue('description') as string);
          }}
        >
          {ONE_YEAR.map(i => {
            const belonging = jfpgInfoList.find(info => !!info.months && info.months.includes(i));
            const description = belonging ? `（${belonging.description}）` : '';
            return (
              <Checkbox key={i} value={i} className="month">
                {MonthMap[i]}
                {description}
              </Checkbox>
            );
          })}
        </Checkbox.Group>
      )}
      <div className="c-jfpg-detail">
        <Radio.Group value={jfpgType} onChange={e => setJfpgType(e.target.value)}>
          <Radio value={JfpgType.JIAN}>
            尖峰
            <span className="tips jian" />
          </Radio>
          <Radio value={JfpgType.FENG}>
            高峰
            <span className="tips feng" />
          </Radio>
          <Radio value={JfpgType.PING}>
            平段
            <span className="tips ping" />
          </Radio>
          <Radio value={JfpgType.GU}>
            低谷
            <span className="tips gu" />
          </Radio>
        </Radio.Group>
        <div className="day-time-ranges">
          {DayTimeRanges.map(i => (
            <Tooltip placement="top" title={i.title} key={i.value}>
              <div className="range" onClick={() => onRangeClick(i.value)} onMouseOver={() => onHoverChange(i.value)}>
                <div className={`left ${getClassName(i)}`} />
                <div className="right" />
              </div>
            </Tooltip>
          ))}
        </div>
        <div className="range-tip">
          <Icon style={{ color: '#CCCCCC', marginRight: 4 }} type="question-circle" theme="filled" />
          先选中分段（尖峰平谷)，再在时间轴上分别单击选择起止时间块，直到无灰色时间块方可。
        </div>
        <div className="price-form">
          {JfpgPriceList.map((i, index) => (
            <div className="price-row" key={i.value}>
              <div className="inline-form">
                {fieldDecorators.input({
                  fieldName: i.value,
                  label: i.label,
                  rules: [
                    {
                      required: true,
                      message: '电价不能为空',
                    },
                    {
                      pattern: validNumber,
                      message: '请输入一个正确的数字',
                    },
                    {
                      validator: validPrecision(MAX_LENGTH),
                      message: '输入数字超过精度范围',
                    },
                  ],
                })(<Input placeholder="请输入电价" style={{ width: 360, marginLeft: 8 }} addonAfter="元/kWh" />)}
              </div>
              <span className="range-label">时段：</span>
              <div className="jfpg-time-range">
                {((getFieldValue(JfpgTypeList[index]) || []) as DayTimeRange[]).map((i, index) => (
                  <span key={index} className="range">
                    {dayTiemRangeToFmtStr(i)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Info;
