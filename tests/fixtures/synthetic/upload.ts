// 手工控制数据，不是网易云录制或真实账号证据。
export const songFile = {
  data: new Uint8Array([1, 2]),
  name: 'demo.mp3',
  size: 2,
  mimetype: 'audio/mpeg',
};
export const tokenBody = {
  code: 200,
  result: {
    token: 'nos-token',
    objectKey: 'voice/demo',
    docId: 'doc-1',
    resourceId: 'resource-1',
  },
};
export const initXml =
  '<InitiateMultipartUploadResult><UploadId>upload-123</UploadId></InitiateMultipartUploadResult>';
export const relatedHtml =
  '<div class="cver u-cover u-cover-3"><img src="cover?param=50y50"><a class="sname f-fs1 s-fc0" href="/playlist?id=1">List</a><a class="nm nm f-thide s-fc3" href="/user/home?id=2">User</a>';
