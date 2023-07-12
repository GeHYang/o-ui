<template>
  <view class="code-box" @click="closeOnClickOverlay && closeCodeBox()">
    <view class="overlay-view" :style="{backgroundColor: overlayColor, opacity: overlayOpacity}"></view>
    <view class="container" :style="boxStyle" @click.stop>
      <view class="tips" :style="{color: titleColor}">
        {{title}}
        <view v-show="closeable" class="close-icon" @click.stop="closeCodeBox">
          <icon color="#bcbcbc" type="cancel" size="26"/>
        </view>
      </view>
      <view class="original">
        <image :src="bg.src" :mode="bg.mode" :style="originStyle"></image>
        <image class="refresh" src="./refresh.png" @click="refresh"></image>
        <image :src="slider.src" class="slider-box" 
          :mode="slider.mode" 
          :style="{...sliderStyle, left: move.left + 'px'}"></image>
      </view>
      <!-- 滑动通道 -->
      <view class="slider-channel">
        <view class="_channel">
          <view class="slider-circle"
            :style="{left: move.left + 'px'}"
            @touchend="moveEnd"
            @touchstart="moveStart"
            @touchmove="moveTouch"
          ><slot name="circle">»</slot></view>
          <view class="channel" 
            :style="{...channelStyle, backgroundColor: channelBG, color: textColor}"
          ><text>{{ channelText }}</text>
            <view class="channel-color" 
              :style="{width: move.left + (circle.width / 2) + 'px', 
              backgroundColor: channelChangeColor, color: changeTextColor}"
            ><text>{{ channelChangeText }}</text></view>
          </view>
        </view>
        
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "code-box",
  data() {
    return {
      channelStyle: { // 滑动管道长度
        width: '100%',
      },
      circle: {
        width: 0,
      },
      move: {
        left: 0
      },
    };
  },
  mounted(){
    this.$nextTick(async () => {
      let sliderChannel = await this.querySelector('.slider-channel');
      let circle = await this.querySelector('.slider-circle');
      let sliderBox = await this.querySelector('.slider-box');
      let _channel = await this.querySelector('._channel');
      // 记录圆宽度
      this.circle.width = circle.width;
      // 记录左边距
      this.move.min = circle.left - _channel.left;
      // 记录右边距
      this.move.max = (this.bg.width || 240) - (this.slider.width || 40);
      // 滑块部分盒子(_channel)宽度：
      //  父盒子宽度(.slider-channel) - 父盒子内边距(20) - 圆形滑块与滑块图片宽度差
      this.channelStyle.width = 
        `calc(${sliderChannel.width - 20}px - ${(sliderBox.width - circle.width)}px)`;
      
      this.move.left = this.move.min;

    })
  },
  methods: {
    moveStart(e){
      // 记录初始位置
      this.move.offsetLefft = e.touches[0].pageX;
    },
    moveEnd(e){
      let offset = this.move.left;
      if(this.endToStart)
        this.move.left = this.move.min;
      // 反馈回去
      this.$emit("change", {x: offset, y: this.slider.y});
    },
    moveTouch(e){
      let moveX = e.touches[0].pageX;
      let left = moveX - this.move.offsetLefft;
      if(left <= this.move.min){
        left = this.move.min;
      } else if(left >= this.move.max){
        left = this.move.max;
      }
      this.move.left = left;
    },
    querySelector(name){
      const query = uni.createSelectorQuery().in(this);
      return new Promise((res) => {
        query.select(name).boundingClientRect(data => {
          res(data);
        }).exec();
      })
    },
    // 点击刷新按钮
    refresh(){
      this.move.left = this.move.min;
      this.$emit("refresh", true);
    },
    // 关闭
    closeCodeBox(){
      this.$emit("close", true);
    },
  },
  props: {
    // 背景原图
    bg: {
      type: Object,
      default(){
        return {src: "",mode: "",width: 240,height: 130}
      },
      require: true
    },
    // 滑动块
    slider: {
      type: Object,
      default(){
        return {src: "",y: 0, width: 40, height: 40,mode: ''}
      },
      require: true
    },
    // 是否显示关闭按钮
    closeable: {
      type: Boolean,
      default: false,
    },
    // 点击遮罩层关闭弹窗
    closeOnClickOverlay: {
      type: Boolean,
      default: false,
    },
    // 遮罩层颜色
    overlayColor: {
      type: String,
      default: "#ccc"
    },
    // 遮罩层透明度：0-1
    overlayOpacity: {
      type: Number,
      default: .5
    },
    // 标题
    title: {
      type: String,
      default: "请完成下方验证"
    },
    // 标题颜色
    titleColor: {
      type: String,
      default: "black"
    },
    // 滑动管道背景颜色
    channelBG: {
      type: String,
      default: "#d5d5e3"
    },
    // 滑动管道滑动时覆盖掉颜色
    channelChangeColor: {
      type: String,
      default: "#639ef6"
    },
    // 滑动管道内的文字
    channelText: {
      type: String,
      default: "拖动滑块完成拼图"
    },
    // 文字颜色
    textColor: {
      type: String,
      default: "white"
    },
    channelChangeText: {
      type: String,
      default: ""
    },
    // 文字颜色
    changeTextColor: {
      type: String,
      default: "white"
    },
    // 滑动验证码框背景
    boxStyle: {
      type: Object,
      default(){
        return {backgroundColor: 'white'}
      }
    },
    // 结束后回到起点
    endToStart: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    originStyle(){
      if(!this.bg.src){
        throw "背景图片路径不能为空";
      }
      return {
        width: (this.bg.width || 240) + 'px',
        height: (this.bg.height || 130) + 'px',
      }
    },
    sliderStyle(){
      if(!this.slider.src){
        throw "滑块路径不能为空";
      }
      return {
        top: (this.slider.y || 0) + 'px',
        width: (this.slider.width || 40) + 'px',
        height: (this.slider.height || 40) + 'px',
      }
    },
  },
};
</script>

<style lang='scss' scoped>
@import url("http://at.alicdn.com/t/c/font_4018428_5opbsiglz6g.css");
*{
  box-sizing: content-box;
}
.code-box {
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: transparent;
  font-size: 14px;

  .overlay-view {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
  }

  .container {
    overflow: hidden;
    box-sizing: content-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: absolute;
    top: 50%;
    left: 50%;
    padding: 5px;
    transform: translate(-50%, -50%);
    height: auto;
    border-radius: 15px;
    box-shadow: 0 0 5px #7a7a7a;
    
    .tips {
      padding: 10px;
      text-align: center;
      flex: none;
      position: relative;

      .close-icon {
        position: absolute;
        top: 0px;
        right: 0px;
        overflow: hidden;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .original{
      position: relative;
      flex: 1;
      margin: 0 5px;
      background-repeat: no-repeat;
      overflow: hidden;

      .refresh {
        position: relative;
        z-index: 100000;
        width: 20px;
        height: 20px;
        line-height: 20px;
        font-size: 18px;
        position: absolute;
        right: 0;
        top: 0;
        border-radius: 50%;
        color: white;
        transition: all .5s;
        &:active {
          transform: rotate(720deg);
        }
      }

      .slider-box {
        z-index: 10000;
        position: absolute;
      }
    }
    .slider-channel {
      position: relative;
      display: flex;
      justify-content: center;
      
      ._channel {
        position: relative;
        padding: 10px;
        .slider-circle {
          flex: 1;
          position: absolute;
          z-index: 1000000;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          line-height: 33px;
          text-align: center;
          font-size: 35px;
          color: #626f82;
          background-color: white;
          border: 1px solid #efefef;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 0 2px #ccc;
        }

        .channel {
          position: relative;
          height: 35px;
          line-height: 35px;
          text-align: center;
          border-radius: 20px;
          text {
            position: absolute;
            left: 50%;
            width: 100%;
            transform: translateX(-50%);
          }

          .channel-color{
            position: absolute;
            top: 0;
            height: 35px;
            line-height: 35px;
            text-align: center;
            width: 0;
            border-radius: 20px;
            text-overflow: clip;
            overflow: hidden;
            text {
              position: absolute;
              z-index: 10;
              left: 50%;
              width: 100%;
              transform: translateX(-50%);
            }
          }
        }
      }
      
    }
  }
}
</style>