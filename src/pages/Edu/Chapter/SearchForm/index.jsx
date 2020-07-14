import React, { useEffect, useState } from "react";
import { Form, Select, Button, message } from "antd";
import { connect } from 'react-redux'
import { reqGetCourseList } from '@api/edu/course'
import { getChapterList } from '../redux'
import "./index.less";

const { Option } = Select;

function SearchForm(props) {
  const [form] = Form.useForm();
  const [Course, setCourse] = useState([])

  const resetForm = () => {
    form.resetFields();
  };

  //获取课程列表数据/组件挂载成功获取数据==>模拟类组件的componentDidMount
  useEffect(() => {
    async function fetchData() {
      const res = await reqGetCourseList()
      setCourse(res)
      console.log(res);
    }
    fetchData()
  }, [])

  //根据课程获取章节列表数据的方法
  const handleGetChapterList = async value => {
    console.log(value);
    const data = {
      page: 1,
      limit: 10,
      courseId: value.courseId
    }
    await props.getChapterList(data)
    message.success('课程章节列表数据获取成功')
  }
  return (
    <Form layout="inline" form={form} onFinish={handleGetChapterList}>
      <Form.Item name="teacherId" label="课程">
        <Select
          allowClear
          placeholder="课程"
          style={{ width: 250, marginRight: 20 }}
        >
          {Course.map(item => (<Option key={item._id} value={item._id}>{item.title}</Option>))}
          {/* <Option value="1">1</Option>
          <Option value="2">2</Option>
          <Option value="3">3</Option> */}
        </Select>
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{ margin: "0 10px 0 30px" }}
        >
          查询课程章节
        </Button>
        <Button onClick={resetForm}>重置</Button>
      </Form.Item>
    </Form>
  );
}

export default connect(
  null,
  { getChapterList }
)(SearchForm);
