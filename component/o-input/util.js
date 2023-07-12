const {emojiList} = require("./o-emoji/emoji")

/**
 * 解析富文本内容
 * @param {Object} html 富文本内容
 */
function parseToText(html) {
  // 1、对img表情进行解析，解析出表情对应的name
  let reg = /<img[\S\s]*?>/g;
  let imgList = html.match(reg);
  let length = imgList?.length || 0;
  html = parseEmojiName(html, imgList);
  // 2、解析用户手动输入的标签文本
  html = parseInTab(html);
  // 3、解析富文本自带标签p
  html = parseDefaultTab(html);
  let html1 = html.replace(new RegExp(/\[[\u4e00-\u9fa5]+\]/, 'g'), '')
  let res = {
    text: html,
    length: html1.length + length
  }
  return res;
};
function parseEmojiName(html, emojiList) {
  try{
    for (const imgStr of emojiList) {
      let name = imgStr.match(/name=[\S\s]*\]/)[0];
      name = name.replace("name=", "");
      html = html.replace(imgStr, name);
    }
  } catch {}
  return html;
};
/**
 * 对用户输入的标签文本进行解析
 * @param {Object} html
 */
function parseInTab(html) {
  html = html.replace("&lt;", "<");
  html = html.replace("&gt;", ">");
  return html;
};
/**
 * 解析富文本编辑器默认标签，p标签
 * @param {Object} html
 */
function parseDefaultTab(html) {
  let reg = new RegExp("<p>", 'g');
  let reg1 = new RegExp("</p>", 'g');
  let reg2 = new RegExp("<br?>", 'g');
  html = html.replace(reg, "");
  html = html.replace(reg1, "\n");
  html = html.replace(reg2, "");
  html = html.substring(0, html.lastIndexOf("\n"));
  return html;
};
/**
 * 解析文本信息为html
 * @param {*} html 
 * @returns 
 */
function parseToHtml(html){
  let reg = /\[(.+?)\]/g; // 匹配[xxx]正则表达式
  let regData = html.match(reg);
  if (!regData) return html;
  for (const emoji of emojiList) {
    let index = regData.indexOf(emoji.regName);
    if (index != -1) {
      let imgStr = `<img src='${emoji.src}' style="width: 20px;height:20px;" />`;
      regData[index] = regData[index].replace("[", "\\[");
      regData[index] = regData[index].replace("]", "\\]");
      let regx = new RegExp(`${regData[index]}`, 'g');
      html = html.replace(regx, imgStr);
    }
  }
  // 将换行替换成br标签
  let regx = new RegExp("\n", 'g');
  html = html.replace(regx, "<br>");
  return html;
}

export {
  parseToText,
  parseToHtml,
}