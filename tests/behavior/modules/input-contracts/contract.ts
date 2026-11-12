export interface ModuleInputCase {
  readonly invalid: ReadonlyArray<unknown>;
  readonly module: string;
  readonly open?: boolean;
  readonly valid: ReadonlyArray<unknown>;
}
