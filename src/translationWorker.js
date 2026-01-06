// src/translationWorker.js
import { pipeline } from '@huggingface/transformers';

class TranslationPipeline {
  static task = 'translation'; // 指定任务类别
  static model = 'Xenova/nllb-200-distilled-600M'; // 指定模型
  static instance = null; // pipeline 的返回实例

  static async getInstance(progress_callback = null) { // 暴露给外部的获取单例对象的方法
    if (this.instance === null) { // 如果单例不存在，则创建
      this.instance = pipeline(
          this.task,  // 任务类别
          this.model, // 选用模型
          { progress_callback } // 这里本是额外的参数，我们在这里预留一个回调函数，来返回模型的下载进度，后续做一个进度条。
      );
    }
    // 那如果之前已经执行过 pipeline，则实例已经存在，就不会再执行上面的创建过程

    return this.instance; // 返回单例对象
  }
}

self.addEventListener('message', async (e) => { // 添加一个事件监听器，用于处理主线程发送的消息
  const { text, src_lang, tgt_lang } = e.data; // 解构消息中的数据
  const translator = await TranslationPipeline.getInstance(load_process => {
    self.postMessage(load_process); // 将模型下载进度发送回主线程
  }); // 获取单例对象

  const output = await translator(text, { src_lang, tgt_lang }); // 调用翻译方法
  self.postMessage({ status: 'complete', output }); // 将翻译结果发送回主线程
});

