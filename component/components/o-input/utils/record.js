// 获取录音对象
const recorder = uni.getRecorderManager();
// 开始录音
function start(options){
  recorder.start(options);
}
// 结束录音
function stop(){
  recorder.stop();
}
function onStop(callback){
  if(callback && typeof callback == 'function'){
    recorder.onStop(callback);
  } else {
    return new Promise((res) => {
      recorder.onStop(result => {
        res(result);
      })
    })
  }
}

export default {
  start, stop, onStop, 
}