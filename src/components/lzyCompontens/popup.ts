import { VNode, h, render } from 'vue';
import '@/assets/css/popup.scss';

/* 弹窗组件 */
// 定义参数类型的接口
interface PopupOptions {
  svgImg: string;
  info: string;
  confirm: () => void;
  title?: string;
  cancel?: string;
  success?: string;
}

// 定义返回虚拟 DOM 的接口
interface PopupVNode extends VNode { }

// 点击确定或者取消按钮
const handleClick = (type: string, confirm?) => () => {
  console.log(type);
  if (type === 'cancel') {
    render(null, document.body);
  } else {
    console.log('success');
    confirm()
  }
  render(null, document.body);
}
// 关闭弹窗
const closePopup = (event) => {
  const target = event.target.className;
  if (target === 'popupShade') {
    render(null, document.body);
  }
}

export const popup = (options: PopupOptions): void => {
  const { svgImg, title = '温馨提示', info, confirm, cancel = '取消', success = '确定' } = options;

  const html: PopupVNode = h('div', { class: 'popupShade', onClick: closePopup },
    h('div', { class: 'popupCard  animate__animated animate__zoomInDown', }, [
      h('img', { class: 'top', src: svgImg }),
      h('div', { class: 'text' }, [
        h('div', { class: 'title' }, [
          title,
        ]),
        h('div', { class: 'info' }, info),
      ]),
      h('div', { class: 'buttons' }, [
        h('div', { class: 'button', onClick: handleClick('cancel'), }, cancel),
        h('div', { class: 'button button-primary', onClick: handleClick('success', confirm), }, success),
      ]),
    ]))
  render(html, document.body);
};
