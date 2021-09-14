// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
// 使用axios获取歌单信息
const axios = require('axios')

const URL = 'https://apis.imooc.com/personalized?icode=92757EF7968F9172'

const playlistCollection = db.collection('playlist')

const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  // const list = await playlistCollection.get()
  const countResult =await playlistCollection.count()
  const total = countResult.total
  const batchTimes =Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  const {data} =await axios.get(URL)
  if (data.code >= 1000) {
    console.log(data.msg)
    //如果code码大于等于1000,服务端返回问题原因
    return 0
  }
  const playlist = data.result
  const newData = []
  for (let i = 0, len1 = playlist.length; i < len1; i++) {
    let flag = true
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (playlist[i].id === list.data[j].id) {
        flag = false
        break
      }
    }
    if (flag) {
      // 给每个歌单信息增加createTime属性
      newData.push(playlist[i])
    }
  }
// 插入数据
  if (newData.length > 0) {
    await playlistCollection.add({
      data: [...newData]
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.log(err)
      console.error('插入失败')
    })
  }
  return newData.length
}