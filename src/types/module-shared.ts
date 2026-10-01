export type QueryBooleanLike = boolean | 0 | 1 | '0' | '1' | 'true' | 'false';
export type QueryNumberLike = number | `${number}`;
export type QueryIdentifier = string | number;

export interface LegacyUploadedFile {
  data: ArrayBuffer | Buffer | Uint8Array;
  md5?: string;
  mimetype: string;
  name: string;
  size: number;
}

export type IdentifierQuery = { id: QueryIdentifier };
export type PagedQuery = { limit?: QueryNumberLike; offset?: QueryNumberLike };
export type IdentifierPagedQuery = IdentifierQuery & PagedQuery;
export type IdentifierActionQuery = IdentifierQuery & { t: 0 | 1 | '0' | '1' };
