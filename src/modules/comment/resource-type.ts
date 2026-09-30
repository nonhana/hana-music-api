const RESOURCE_TYPE_MAP: Readonly<Record<string, string>> = {
  0: 'R_SO_4_',
  1: 'R_MV_5_',
  2: 'A_PL_0_',
  3: 'R_AL_3_',
  4: 'A_DJ_1_',
  5: 'R_VI_62_',
  6: 'A_EV_2_',
  7: 'A_DR_14_',
};

export const resolveResourceType = (value: unknown): string => {
  return RESOURCE_TYPE_MAP[String(Number(value ?? 0))] ?? 'R_SO_4_';
};
