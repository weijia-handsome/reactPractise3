import React, { Component } from 'react'
import { Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

// 引入七牛云
import * as qiniu from 'qiniu-js'
import { nanoid } from 'nanoid'

//引入lesson里的方法
import { reqGetQiniuToken } from '@api/edu/lesson'

const MAX_VIDEO_SIZE = 20 * 1024 * 1024
export default class MyUpload extends Component {
    //定义构造函数
    //构造函数中只是从缓存中获取数据/定义状态
    constructor() {
        super()
        //一进来要从缓存中获取有没有token
        const str = localStorage.getItem('upload_token')

        if (str) {
            //如果是有内容的字符串,说明之前存储过token
            //这里没有必要判断token是否已经过期,只需要把从缓存中拿到的值,赋值给state就可以
            //把缓存中字符串拿到，转成对象,对象中有uploadToken,expires
            const res = JSON.parse(str)
            this.state = {
                expires: res.expires,
                uploadToken: res.uploadToken
            }
        } else {
            //没有内容 undefined，没有存储过
            this.state = {
                expires: 0,
                uploadToken: ''
            }
        }
    }
    //上传视频之前用
    handleBeforeUpload = (file) => {
        return new Promise(async (resolve, reject) => {
            if (file.size > MAX_VIDEO_SIZE) {
                message.error('视频太大,不能超过20M')
                reject('视频太大,不能超过20M')
                return
            }
            //在请求之前,只需要判断token是否过期
            if (Date.now() > this.state.expires) {
                //过期了就要重新获取
                const { uploadToken, expires } = await reqGetQiniuToken()
                //将数据存储起来
                //state里面有最新的数据,本地缓存中也是有最新的数据
                this.saveUploadToken && this.saveUploadToken(uploadToken, expires)
            }
            //2.请求上传的token
            resolve(file)
        })
    }
    //自定义上传
    //调用七牛云的sdk实现上传
    //customRequest可以接收一个file,就是要上传的file
    customRequest = ({ file, onProgress, onError, onSuccess }) => {
        //调用七牛云sdk实现上传
        //创建putExtra对象
        const putExtra = {
            fname: '',//文件原名称
            params: '',//用来放置自定义变量
            mimeType: ['video/*']//用来限定上传文件类名
        }
        //创建config对象
        const config = {
            region: qiniu.region.z2 // 选择上传域名区域 z2表示华南
        }
        //生成一个长度为10的id,保证是唯一的
        const key = nanoid(10)

        //需要给本地服务器发送请求获取token
        const token = this.state.uploadToken

        const observable = qiniu.upload(
            file, // 上传的文件
            key, //最终上传之后的文件资源名 (保证唯一) 使用nanoid库,生成这个key
            token, //上传验证信息，前端通过接口请求后端获得
            putExtra,
            config
        )
        //创建上传过程中触发回调函数的对象
        const observer = {
            //上传过程中触发的回调函数
            next(res) {
                //res中有total属性,total中有percent属性,表示上传的进度
                const percent = res.total.percent
                //把进度条传入到onProgress中,可以有进度条的效果
                onProgress({ percent })
            },
            //上传失败触发的回调函数
            error(err) { 
                //上传失败会有一个失败的效果
                onError(err)
            },
            //上次成功触发的回调函数
            complete: res => { 
                console.log('上传视频--complete',res);
                //上传成功会有一个成功的效果
                onSuccess(res)
                this.props.onChange('路径')
            }
        }
        //上传开始
        const subscription = observable.subscribe(observer)
        //上传取消
        //subscription.unsubscribe()
    }


    //真正上传视频时调用,这个函数会覆盖默认的上传方式
    handleCustomRequest = () => {
        console.log('上传了');
        console.log(this.state.uploadToken);
    }
    render() {
        return (
            <div>
                <Upload
                    beforeUpload={this.handleBeforeUpload}
                    customRequest={this.handleCustomRequest}

                >
                    <Button>
                        <UploadOutlined /> 上传视频
                    </Button>
                </Upload>
            </div>
        )
    }
}
