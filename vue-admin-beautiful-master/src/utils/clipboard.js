import Vue from 'vue'
//是一款轻量级的实现复制文本到剪贴板功能的JavaScript插件。通过该插件可以将输入框，文本域，DIV元素中的文本等文本内容复制到剪贴板中
import Clipboard from 'clipboard'

function clipboardSuccess() {
  Vue.prototype.$baseMessage('复制成功', 'success')
}

function clipboardError() {
  Vue.prototype.$baseMessage('复制失败', 'error')
}

/**
 * @author chuzhixin 1204505056@qq.com （不想保留author可删除）
 * @description 复制数据
 * @param text
 * @param event
 */
export default function handleClipboard(text, event) {
  const clipboard = new Clipboard(event.target, {
    text: () => text,
  })
  clipboard.on('success', () => {
    clipboardSuccess()
    clipboard.destroy()
  })
  clipboard.on('error', () => {
    clipboardError()
    clipboard.destroy()
  })
  clipboard.onClick(event)
}
