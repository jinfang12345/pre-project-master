import { CircuitType } from '@maxtropy/kingfisher-api';

export function circuitIsTie(type: CircuitType) {
  return type === CircuitType.V10K_TIE || type === CircuitType.V400_BUS_TIE || type === CircuitType.V35K_TIE;
}

/**
 * 中文、英文大小写、数字、下划线
 */
export const CHN_NAME_REGEXP = /^[a-z0-9_\u4e00-\u9fff]*$/i;
