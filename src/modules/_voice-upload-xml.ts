const UPLOAD_ID_PATTERN = /<UploadId>([^<]+)<\/UploadId>/iu

export function parseMultipartUploadId(xml: string): string {
  const match = xml.match(UPLOAD_ID_PATTERN)
  const uploadId = match?.[1]?.trim()

  if (!uploadId) {
    throw new TypeError('Missing UploadId in multipart upload response XML')
  }

  return uploadId
}

export function createMultipartCompleteXml(etags: readonly string[]): string {
  const parts = etags
    .map((etag, index) => {
      return `<Part><PartNumber>${index + 1}</PartNumber><ETag>${etag}</ETag></Part>`
    })
    .join('')

  return `<CompleteMultipartUpload>${parts}</CompleteMultipartUpload>`
}
