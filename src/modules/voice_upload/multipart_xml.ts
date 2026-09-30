import { Effect } from 'effect';

import { UnexpectedUpstreamShape } from '../../core/errors.ts';

export const parseMultipartUploadId = (xml: unknown) => {
  const uploadId =
    typeof xml === 'string'
      ? xml.match(/<UploadId>([^<]+)<\/UploadId>/iu)?.[1]?.trim()
      : undefined;
  return uploadId
    ? Effect.succeed(uploadId)
    : Effect.fail(
        new UnexpectedUpstreamShape({
          module: 'voice_upload',
          path: 'UploadId',
          expected: 'non-empty XML UploadId',
          actual: typeof xml,
        }),
      );
};

export const createMultipartCompleteXml = (
  etags: ReadonlyArray<string>,
): string => {
  const parts = etags
    .map(
      (etag, index) =>
        `<Part><PartNumber>${index + 1}</PartNumber><ETag>${etag}</ETag></Part>`,
    )
    .join('');
  return `<CompleteMultipartUpload>${parts}</CompleteMultipartUpload>`;
};
