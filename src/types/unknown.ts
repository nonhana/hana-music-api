export type UnknownJson =
  | boolean
  | number
  | string
  | null
  | Array<UnknownJson>
  | { [key: string]: UnknownJson };
