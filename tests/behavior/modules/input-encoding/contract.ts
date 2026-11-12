import type { ModuleIdentifier } from '../../../../src/types/index.ts';

export interface EncodingWire {
  readonly body: string;
  readonly url: string;
}

export interface EncodingCase {
  readonly check: (wires: ReadonlyArray<EncodingWire>) => void;
  readonly input: Record<string, unknown>;
  readonly module: ModuleIdentifier;
  readonly respond?: (
    wire: EncodingWire,
    index: number,
  ) => Response | undefined;
}
