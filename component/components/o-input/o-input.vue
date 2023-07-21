<template>
  <view class="o-input" @click="editorBlur" :style="{width: inputStyle.width}">
    <view class="container" :style="{...inputStyle, width: '100%'}">
      <view class="l-prefix">
        <slot name="prefix">
          <view v-if="voice" class="prefix-icon" @click.stop="cutPreIcon">
            <view class="iconfont" :class="'icon-' + preIconKey"></view>
          </view>
        </slot>
      </view>
      <!-- 文本输入 -->
      <view class="in-box" v-show="preIconKey === 'voice'">
        <editor id="editor" 
          class="ql-container"
          @ready="onEditorReady" 
          :placeholder="placeholder"
          @click.stop="editorFocus"
          @input="inputText"
          @blur="editorBlur"
        ></editor>
        <view class="r-icon" @click.stop="showEmoji">
          <slot name="suffix">
            <view class="d-icon iconfont icon-xiaolian"></view>
          </slot>
        </view>
        <view class="btn" @click.stop="submit">
          <slot name="r-btn">
            <button class="submit-btn" :class="inText.text || 'no-text-btn'" 
              :disabled="!inText.text" size="mini" type="primary"
            >发送</button>
          </slot>
        </view>
      </view>
      <!-- 语音输入 -->
      <view class="in-box" v-show="preIconKey === 'keyboard'">
        <!-- 语音输入框 -->
        <view class="voice-btn" 
          @longtap="longtapEvent" 
          @touchend="endEvent"
          @touchcancel="endEvent"
          @touchmove="moveEvent"
        >
          <slot name="voice-btn">按住说话</slot>
        </view>
      </view>
    </view>
    <view v-show="showEmojiBox" class="emoji-box" :style="emojiStyle">
      <o-emoji @click="insertEmoji"></o-emoji>
    </view>
    <view v-show="sayVoice" class="o-record-overlay">
      <slot name="record-overlay">
          <view class="close-icon" :class="sayVoiceMove.cancel && 'close-icon-cancel'">
            <i class="iconfont icon-cuowu"></i>
          </view>
          <view class="voice-icon">
            <view class="d-icon iconfont icon-yuyin1"></view>
          </view>
          <view class="animate-box" :class="sayVoiceMove.cancel ? 'animate-box-cancel' : ''">
            <span class="start-taste-line">
              <i v-for="index in (sayVoiceMove.cancel ? 5 : 25)" :key="index" :style="{'--i': index + 1}" />
            </span>
          </view>
      </slot>
    </view>
  </view>
</template>

<script>
import oEmoji from './o-emoji/o-emoji.vue';
import record from './utils/record';
import { parseToText, parseToHtml } from './utils/util';
export default {
  components: { oEmoji },
  name: "o-input",
  data() {
    return {
      showEmojiBox: false,
      inText: {},
      inFlag: false,
      preIconKey: "voice",
      sayVoice: false,
      sayVoiceMove: {
        x: 0,
        cancel: false,
      },
      prefixIcon: ['voice','keyboard'],
      recordInterval: {
        fun: null,
        time: 0,
        timeout: false,
      },
    };
  },
  mounted(){
    if(!this.voice){
      this.preIconKey = "voice";
    }
    if(!(typeof this.maxRecordLen === 'number')){
      this.maxRecordLen = 59;
    }
  },
  methods: {
    showEmoji(){
      this.showEmojiBox = !this.showEmojiBox;
    },
    insertEmoji(emoji) {
      this.$emit("clickEmoji", emoji);
      this.showEmojiBox = false;
      this.editorCtx.insertImage({
        src: emoji.src,
        width: this.eSize,
        height: this.eSize,
        extClass: 'emoji',
        data: {
          name: emoji.regName
        }
      })
    },
    submit(){
      if(!this.inText?.text) return;
      let detail = {...this.inText};
      detail.html = parseToHtml(detail.text);
      this.$emit("change", detail);
      this.editorCtx.clear();
    },
    inputText(e) {
      this.getContents().then(res =>{
        this.inText = res;
        this.$emit("input", this.inText.text)
      })
    },
    getContents(){
      return new Promise((resolve) => {
        this.editorCtx.getContents({
          success: (res) => {
            let inText = parseToText(res.html);
            resolve(inText)
          }
        })
      })
    },
    editorFocus(e){
      if(!this.resize) return;
      this.showEmojiBox = false;
    },
    editorBlur(){
      if(!this.clickBlankBlur) return;
      this.showEmojiBox = false;
    },
    onEditorReady() {
      uni.createSelectorQuery().select('#editor').context((res) => {
        this.editorCtx = res.context
      }).exec()
    },
    cutPreIcon(){
      let key = this.prefixIcon.filter(val => val != this.preIconKey);
      this.preIconKey = key[0];
    },
    longtapEvent(e){
      this.sayVoiceMove.x = e.touches[0].pageY;
      this.sayVoice = true;
      record.start();
      this.recordInterval.fun = setInterval(() => {
        if(this.recordInterval.time >= this.maxRecordLen){
          clearInterval(this.recordInterval.fun);
          this.endEvent();
          this.recordInterval.timeout = true;
        }
        this.recordInterval.time++;
      }, 1000);
    },
    moveEvent(e){
      if(this.sayVoiceMove.x - e.touches[0].pageY > this.offsetY){
        this.sayVoiceMove.cancel = true;
      } else {
        this.sayVoiceMove.cancel = false;
      }
    },
    async endEvent(){
      if(this.recordInterval.timeout){
        this.recordInterval.timeout = false;
        return;
      }
      record.stop();
      clearInterval(this.recordInterval.fun);
      let result = await record.onStop();
      if(this.recordInterval.time < this.minRecordLen){
        uni.showToast({
          title: "语音时长过短",
          icon: 'none',
          duration: 1000
        });
      } else {
        this.$emit("record", {
          cancel: this.sayVoiceMove.cancel, 
          duration: this.recordInterval.time, 
          result: {...result}
        });
      }
      this.sayVoice = false;
      this.sayVoiceMove.cancel = false;
      this.recordInterval.time = 0;
    }
  },
  props: {
    width: {
      type: String,
      default: "100vw"
    },
    height: {
      type: String,
      default: "30"
    },
    emojiSize: {
      type: String,
      default: "20"
    },
    fontSize: {
      type: Number,
      default: 16
    },
    clickBlankBlur: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: '请输入内容'
    },
    emojiStyle: {
      type: Object,
      default: () => {
        return {}
      }
    },
    resize: {
      type: Boolean,
      default: false,
    },
    voice: {
      type: Boolean,
      default: false,
    },
    maxRecordLen: {
      type: Number,
      default: 59
    },
    minRecordLen: {
      type: Number,
      default: 1
    },
    offsetY: {
      type: Number,
      default: 40,
      require: true
    }
  },
  computed: {
    inputStyle(){
      let regx = /[a-zA-Z%]/;
      let style = {
        width: this.width,
        height: this.height,
        fontSize: this.fontSize,
        minHeight: this.height,
        lineHeight: this.height
      }
      if(!regx.test(this.width)){
        style.width = this.width + 'px';
      }
      if(!regx.test(this.height)){
        style.height = this.height + 'px';
        style.minHeight = this.height + 'px';
        style.lineHeight = this.height + 'px';
      }
      return style;
    },
    eSize(){
      let regx = /[a-zA-Z%]/;
      if(!regx.test(this.emojiSize)){
        return this.emojiSize + 'px';
      }
      return this.emojiSize
    }
  },
};
</script>

<style lang='scss' scoped>
@import url("./font/iconfont.css");
*{
  box-sizing: border-box;
}
.o-input {
  padding: 5px 5px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background-color: transparent;

  .container {
    box-sizing: content-box;
    font-size: inherit;
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    overflow: hidden;
    padding: 3px 0;

    .l-prefix {
      height: 100%;
      flex: 0;

      .prefix-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 100%;
        .iconfont {
          font-size: 20px;
          color: #393939;
        }
      }
    }
    .in-box {
      flex: 1;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      height: 100%;
      max-height: inherit;
      .ql-container {
        flex: 1;
        font-size: inherit;
        display: block;
        height: inherit;
        min-height: inherit;
        max-height: 100%;
        padding: 0 5px;
        outline: none;
        line-height: inherit;
        background-color: white;

        ::v-deep .ql-blank:before {
          font-style: initial;
          top: 50%;
          transform: translateY(-50%);
        }
        ::v-deep p {
          display: flex;
          align-items: center;
          height: inherit;
        }
      }
      .r-icon {
        flex: 0;
        display: flex;
        align-items: center;
        padding: 0 5px;
        .d-icon{
          font-size: 20px;
          color: #555555;
        }
      }
      .btn {
        height: inherit;
        padding: 2px;
        .submit-btn {
          height: 100%;
          width: 45px;
          font-size: 10px;
          border-radius: 0;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          &::after {
            border: none;
          }
          &:active {
            background-color: green;
          }
        }
        .no-text-btn {
          background-color: rgb(228, 228, 228);
          color: black;
          &:active {
            background-color: rgb(228, 228, 228);
          }
        }
      }
      // 语音输入框
      .voice-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80%;
        height: 100%;
        margin: 0 auto;
        background-color: white;
        &:active {
          background-color: rgb(177, 174, 195);
          color: white;
        }
      }
    }
  }
  .emoji-box{
    width: 100%;
    background-color: #efefef;
  }
  .o-record-overlay {
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    background-color: rgba($color: #474747, $alpha: .95);

    .close-icon {
      transition: all .5s;
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      bottom: 100px;
      left: 50px;
      width: 50px;
      height: 50px;
      line-height: 50px;
      text-align: center;
      font-size: 30px;
      border-radius: 50%;
      background-color: #393939;
      color: #9c9c9c;

      i {
        font-style: normal;
        font-size: 20px;
        transform: rotate(-20deg);
      }
    }
    .close-icon-cancel {
      background-color: white;
      color: black;
      transform: scale(1.5);
      &::before {
        content: "松开 取消";
        color: #a0a0a0;
        position: absolute;
        top: -35px;
        left: -15px;
        font-size: 8px;
        width: 80px;
        border-radius: 0;
      }
    }
    .voice-icon {
      display: flex;
      justify-content: center;
      width: 180%;
      height: 60%;
      position: absolute;
      bottom: -50%;
      left: -40%;
      border-radius: 50%;
      background-color: #3a3a3a;
      .d-icon {
        margin-top: 25px;
        font-size: 20px;
        color: #aaa;
      }
    }
    .animate-box {
      transition: all .5s;
      position: absolute;
      bottom: 40%;
      left: 50%;
      width: 120px;
      height: 60px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 15px;
      transform: translateX(-50%);
      background-color: #97ec6a;
      .start-taste-line{
        display: flex;
        i {
          background-color: black;  //声波颜色
          width: 1px;
          height: 4px;
          margin: 0 1px;
          display: block;
          border: none;
          animation: note 0.2s ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          animation-delay: calc(-0.1s * var(--i));

          @keyframes note {
            from {
              transform: scaleY(1);
            }
            to {
              transform: scaleY(4);
            }
          }
        }
      }
      &::after {
        content: "";
        width: 15px;
        height: 15px;
        position: absolute;
        bottom: -5px;
        background-color: inherit;
        transform: rotate(45deg);
      }
    }
    .animate-box-cancel {
      box-sizing: border-box;
      width: 80px;
      left: 35px;
      transform: translateX(0);
      bottom: 200px;
      background-color: #fb5353;
      &::after{
        background-color: #fb5353;
      }
    }
  }
}
</style>