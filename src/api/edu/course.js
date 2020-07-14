import request from '@utils/request'
const BASE_URL = '/admin/edu/course'

// 现在要从mock上面获取数据,所以重新定义一个请求mock的路径
// 这里有主机名,就不会和proxy拼接了
// const MOCK_URL = `http://localhost:8888${BASE_URL}`

// 获取课程分类
export function reqGetCourseList(page, limit) {
    // request返回一个promise
    return request({
        url: `${BASE_URL}`,
        // http://localhost:8888/admin/edu/subject/1/10
        method: 'GET'
    })
}