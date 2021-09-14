const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },
  pageLifetimes: {
    show(){
      this.setData({
        playingId: parseInt(app.getPlayMusicId())
      })
    }
  },
  

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      // 事件原 事件处理函数 事件对象 事件类型
      // const musicid = event.currentTarget.dataset.musicid
      const ds = event.currentTarget.dataset
      const musicid = ds.musicid
      // console.log(event.currentTarget.dataset.musicid)

      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicid}&index=${ds.index}`,
      })
    }
  }
})
