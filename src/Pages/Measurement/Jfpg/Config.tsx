import React, { useState, useEffect } from 'react';
import { Form, Radio, Tabs, Icon } from 'antd';
import { RenderProps, RenderListForm } from '@maxtropy/form';
import {
  JfpgSeasonMode,
  JfpgInfo,
  Jfpg,
  DayTimeRange,
  JfpgType,
  JfpgPriceType,
  JfpgSeasonModeLabel,
  generateLabelList,
} from '@maxtropy/kingfisher-api';
import { validNumber, validPrecision } from '../rules';
import Info from './Info';
import './Config.less';

const SeasonModeOptions = generateLabelList(JfpgSeasonModeLabel, [
  JfpgSeasonMode.FULL_YEAR,
  JfpgSeasonMode.SUMMER_NON_SUMMER,
  JfpgSeasonMode.HIGH_FLAT_LOW_WATER_PERIOD,
  JfpgSeasonMode.CUSTOM,
]);

const getSeasonDefaultValue = (description: string, months: number[]): JfpgInfo => {
  return {
    description,
    months,
    [JfpgType.FENG]: [],
    fengPrice: undefined,
    [JfpgType.GU]: [],
    guPrice: undefined,
    [JfpgType.JIAN]: [],
    jianPrice: undefined,
    [JfpgType.PING]: [],
    pingPrice: undefined,
  };
};

const MIN_MINUTE = 0;
const MAX_MINUTE = 24 * 60;

export const MonthMap = {
  1: '1月',
  2: '2月',
  3: '3月',
  4: '4月',
  5: '5月',
  6: '6月',
  7: '7月',
  8: '8月',
  9: '9月',
  10: '10月',
  11: '11月',
  12: '12月',
};
export const ONE_YEAR = Array.from({ length: 12 }, (_, i) => i + 1);

export const getDefaultInfoList = (): { [key: number]: JfpgInfo[] } => ({
  [JfpgSeasonMode.FULL_YEAR]: [getSeasonDefaultValue('全年', ONE_YEAR)],
  [JfpgSeasonMode.SUMMER_NON_SUMMER]: [getSeasonDefaultValue('非夏季', []), getSeasonDefaultValue('夏季', [])],
  [JfpgSeasonMode.HIGH_FLAT_LOW_WATER_PERIOD]: [
    getSeasonDefaultValue('丰水期', []),
    getSeasonDefaultValue('平水期', []),
    getSeasonDefaultValue('枯水期', []),
  ],
  [JfpgSeasonMode.CUSTOM]: ONE_YEAR.map(i => getSeasonDefaultValue(MonthMap[i], [i])),
});

const checkMonths = (jfpgInfoList: JfpgInfo[]): boolean => {
  const sum = jfpgInfoList.reduce((prev, info) => {
    prev += (info.months || []).length;
    return prev;
  }, 0);
  return sum === ONE_YEAR.length;
};

const checkEmptyMonth = (jfpgInfoList: JfpgInfo[]): JfpgInfo | undefined => {
  return jfpgInfoList.find(i => !Array.isArray(i.months) || !i.months.length);
};

export const sortTimeRange = (a: DayTimeRange, b: DayTimeRange) => a.fromMinute - b.fromMinute;

const checkDayTimeRange = (jfpgInfoList: JfpgInfo[]): JfpgInfo | undefined => {
  return jfpgInfoList.find(i => {
    const ranges = Object.values(JfpgType)
      .reduce((prev, type) => prev.concat(i[type]), [])
      .sort(sortTimeRange) as DayTimeRange[];
    if (ranges.length === 0) {
      return true;
    } else {
      if (ranges[0].fromMinute !== MIN_MINUTE || ranges[ranges.length - 1].toMinute !== MAX_MINUTE) {
        return true;
      }
      return !!ranges.slice(1).find((i, index) => i.fromMinute !== ranges[index].toMinute);
    }
  });
};

export const MAX_LENGTH = 6;
export const inValidNumber = (value: string) => {
  return '' + value === '' || value === undefined || !validNumber.test(value) || !validPrecision(MAX_LENGTH)(value);
};

const checkPrice = (jfpgInfoList: JfpgInfo[]): JfpgInfo | undefined => {
  return jfpgInfoList.find(i => Object.values(JfpgPriceType).some(type => inValidNumber(i[type])));
};

interface JfpgConfigProps extends RenderProps<Jfpg> {
  setConfirm: Function;
}

const Config: React.FunctionComponent<JfpgConfigProps> = props => {
  const { getFieldValue, setFieldValue, fieldDecorators, validateFieldsAndScroll, createListForm } = props.form;
  const seasonMode = getFieldValue('seasonMode');

  const [activeMode, setActiveMode] = useState((getFieldValue('jfpgInfoList') as JfpgInfo[])[0].description);
  const [errInfo, setErrInfo] = useState({
    show: false,
    msg: '',
  });
  const showChangeSeasonMonth =
    seasonMode === JfpgSeasonMode.HIGH_FLAT_LOW_WATER_PERIOD || seasonMode === JfpgSeasonMode.SUMMER_NON_SUMMER;

  const onSeasonModeChange = (e: any) => {
    const value = e.target['value'] as JfpgSeasonMode;
    const jfpgInfoList = getDefaultInfoList()[value];
    setFieldValue('jfpgInfoList', jfpgInfoList);
    setActiveMode(jfpgInfoList[0].description);
  };
  const onSeasonMonthChange = (months: number[], description: string) => {
    const jfpgInfoList = getFieldValue('jfpgInfoList') as JfpgInfo[];
    const result = jfpgInfoList.map(i => ({
      ...i,
      months:
        i.description === description
          ? months.sort((a, b) => a - b)
          : (i.months || []).filter(m => !months.includes(m)),
    }));
    setFieldValue('jfpgInfoList', result);
  };

  const swictToErrorTab = (info: JfpgInfo) => {
    const jfpgInfoList = getFieldValue('jfpgInfoList') as JfpgInfo[];
    let target = jfpgInfoList.find(i => i.description === info.description);
    setActiveMode((target as JfpgInfo).description);
  };
  /**
   * 点击确认按钮，执行 validateFieldsAndScroll 获取表单值
   * 校验过于复杂，需要自己根据表单里的值做判断
   * 1、jfpgInfoList 中每一项的 months 长度加起来应该是 12
   * 2、jfpgInfoList 中每一项的 months 长度应该大于等于 1
   * 3、jfpgInfoList 中每一项的 jian + feng + ping + gu 应该凑满 24 小时
   * 4、jfpgInfoList 中每一项的 xxxPrice 不应该是空的
   */
  const confirm = (): { error: boolean; value?: Jfpg } => {
    const { value } = validateFieldsAndScroll();
    const jfpgInfoList = value.jfpgInfoList as JfpgInfo[];
    const monthRes = checkEmptyMonth(jfpgInfoList);
    if (monthRes) {
      setErrInfo({
        show: true,
        msg: `${monthRes.description}未选择月份，请继续选择`,
      });
      swictToErrorTab(monthRes);
      return { error: true };
    }
    if (!checkMonths(jfpgInfoList)) {
      setErrInfo({
        show: true,
        msg: '存在月份未被任何季节选中，请继续选择',
      });
      return { error: true };
    }
    const tiemRangeRes = checkDayTimeRange(jfpgInfoList);
    if (tiemRangeRes) {
      setErrInfo({
        show: true,
        msg: `${tiemRangeRes.description}尖峰平谷时段未覆盖全天24小时，请继续选择`,
      });
      swictToErrorTab(tiemRangeRes);
      return { error: true };
    }
    const priceRes = checkPrice(jfpgInfoList);
    if (priceRes) {
      setErrInfo({
        show: true,
        msg: `${priceRes.description}电价信息填写有误，请继续填写`,
      });
      swictToErrorTab(priceRes);
      return { error: true };
    }
    setErrInfo({
      show: false,
      msg: '',
    });
    return { error: false, value };
  };

  useEffect(
    () =>
      props.setConfirm({
        confirm,
      }),
    [],
  );
  useEffect(() => {
    if (errInfo.show) {
      setTimeout(
        () =>
          setErrInfo({
            show: false,
            msg: errInfo.msg,
          }),
        2000,
      );
    }
  }, [errInfo]);
  const message = (
    <div className="alert">
      <Icon style={{ color: '#FF1A3B', fontSize: 18, marginRight: 8 }} theme="filled" type="exclamation-circle" />
      {errInfo.msg}
    </div>
  );

  const renderFunction: RenderListForm<Jfpg, JfpgInfo> = props => (
    <Info
      {...props}
      jfpgInfoList={getFieldValue('jfpgInfoList') as JfpgInfo[]}
      showChangeSeasonMonth={showChangeSeasonMonth}
      showError={!!errInfo.msg}
      onSeasonMonthChange={onSeasonMonthChange}
    />
  );
  const listForm = createListForm({
    fieldName: 'jfpgInfoList',
  })(renderFunction);
  return (
    <Form className="c-jfpg-config" layout="vertical">
      {errInfo.show && message}
      <div className="season-mode">
        {fieldDecorators.radioGroup({
          fieldName: 'seasonMode',
          rules: [{ required: true }],
          label: '季节类型',
        })(
          <Radio.Group onChange={onSeasonModeChange}>
            {SeasonModeOptions.map(i => (
              <Radio key={i.value} value={i.value}>
                {i.label}
              </Radio>
            ))}
          </Radio.Group>,
        )}
      </div>
      <div className="season-config">
        <Tabs activeKey={activeMode} onChange={setActiveMode}>
          {(getFieldValue('jfpgInfoList') as JfpgInfo[]).map((info, index) => {
            const tab =
              seasonMode === JfpgSeasonMode.CUSTOM
                ? `${info.description}`
                : `${info.description}${info.months && info.months.length ? `（${info.months.join('、')}）月` : ''}`;
            return (
              <Tabs.TabPane tab={tab} key={info.description as string}>
                {listForm[index]}
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    </Form>
  );
};

export default Config;
