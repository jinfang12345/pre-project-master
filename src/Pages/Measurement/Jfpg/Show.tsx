import React from 'react';
import {
  JfpgInfo,
  DayTimeRange,
  JfpgPriceLabel,
  JfpgPriceType,
  JfpgType,
  JfpgSeasonMode,
} from '@maxtropy/kingfisher-api';
import moment from 'moment';
import './Show.less';

interface JfpgShowProps {
  jfpgInfo: JfpgInfo;
  seasonMode?: JfpgSeasonMode;
}

interface PriceInfo {
  priceKey: JfpgPriceType;
  dayTimeRangeKey: JfpgType;
}

const PriceConfig: PriceInfo[] = [
  {
    priceKey: JfpgPriceType.JIAN,
    dayTimeRangeKey: JfpgType.JIAN,
  },
  {
    priceKey: JfpgPriceType.FENG,
    dayTimeRangeKey: JfpgType.FENG,
  },
  {
    priceKey: JfpgPriceType.PING,
    dayTimeRangeKey: JfpgType.PING,
  },
  {
    priceKey: JfpgPriceType.GU,
    dayTimeRangeKey: JfpgType.GU,
  },
];

const minutesToHourANdMinute = (minutes: number): { hour: number; minute: number } => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes - 60 * hour;
  return {
    hour,
    minute,
  };
};

export const dayTiemRangeToFmtStr = (range: DayTimeRange) => {
  const from = moment(minutesToHourANdMinute(range.fromMinute)).format('HH:mm');
  const to = range.toMinute === 24 * 60 ? '24:00' : moment(minutesToHourANdMinute(range.toMinute)).format('HH:mm');
  return `${from}~${to}`;
};

const Show: React.FunctionComponent<JfpgShowProps> = props => {
  const { jfpgInfo } = props;
  return (
    <div className="c-jfpg-show">
      <div className="jfpg-header">
        <span>{jfpgInfo.description}</span>
        {props.seasonMode !== JfpgSeasonMode.CUSTOM && (
          <span>
            {Array.isArray(jfpgInfo.months) && jfpgInfo.months.length ? `${jfpgInfo.months.join('、')}月` : ''}
          </span>
        )}
      </div>
      <div className="jfpg-info-list">
        {PriceConfig.map(config => {
          const dayTimeRange = jfpgInfo[config.dayTimeRangeKey] || [];
          const price = '' + jfpgInfo[config.priceKey];
          return (
            <div className="jfpg-info" key={config.priceKey}>
              <div className="jfpg-price">
                <span className="description">{JfpgPriceLabel[config.priceKey]}：</span>
                <span className={`price ${config.dayTimeRangeKey}`}>{price ? `${price}元/kWh` : ''}</span>
              </div>
              <div className="jfpg-time-range">
                {dayTimeRange.map((i, index) => (
                  <span className="range" key={index}>
                    {dayTiemRangeToFmtStr(i)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Show;
