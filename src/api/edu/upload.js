// api/edu/upload.js
import request from '@utils/request'
//获取七牛云上传token
export function reqGetUploadToken() {
  return request({
    url: `/uploadtoken`,
    method: 'GET'
  })
}