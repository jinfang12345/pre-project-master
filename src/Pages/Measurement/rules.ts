export const validNumber = /^([0-9]+(\.(\d)+)?)$/;

export const validPrecision = (max: number) => (v: any) => `${v}`.replace('.', '').length <= max;
