import { useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

export default function App() {
  const [count, setCount] = useState(0)
  const [disabled, setDisabled] = useState(false);
  // 输入/输出
  const [inputText, setInputText] = useState('Hello, world!');
  const [outputText, setOutputText] = useState('');
  const [srcLang, setSrcLang] = useState('eng_Latn');
  const [tgtLang, setTgtLang] = useState('zho_Hans');

   const translationWorker = useRef(null); // 创建一个用于保存 Worker 线程的 ref 对象

    useEffect(() => { // 每次组件渲染后执行
      if (!translationWorker.current) { // 如果 Worker 线程不存在，则创建
        // 创建一个新的 Worker 线程，加载 translationWorker.js 文件
        translationWorker.current = new Worker(
          new URL('./translationWorker.js', import.meta.url), // 传入 translationWorker.js 文件的 URL
          {
            type: 'module' // 指定 Worker 线程的类型为模块（以支持 ES Module）
          }
        );
      }

      translationWorker.current.addEventListener('message', handleWorkerMessage);

    },[]); // 为 useEffect() 添加第二个参数 “[]”


    const handleTranslate = () => {
      setDisabled(true); // 禁用按钮
      translationWorker.current.postMessage({
        text: inputText,
        src_lang: srcLang,
        tgt_lang: tgtLang
      });
    }

    const handleWorkerMessage = (e) => {
        switch (e.data.status) {
        case 'complete': // 如果翻译完成
          setOutputText(e.data.output[0].translation_text); // 更新输出文本
          setDisabled(false); // 启用按钮
          break;
      };
    };

  return (
    <>
      <div className='container'>
        <div className='language-container'>
          <select value={srcLang} onChange={e => setSrcLang(e.target.value)} aria-label='源语言'>
            <option value='eng_Latn'>English</option>
            <option value='zho_Hans'>简体中文</option>
          </select>
          <select value={tgtLang} onChange={e => setTgtLang(e.target.value)} aria-label='目标语言'>
            <option value='eng_Latn'>English</option>
            <option value='zho_Hans'>简体中文</option>
          </select>
        </div>

        <div className='textbox-container'>
          <textarea value={inputText} rows={3} onChange={e => setInputText(e.target.value)}></textarea>
          <textarea value={outputText} rows={3} readOnly></textarea>
        </div>
      </div>

      <button disabled={disabled} onClick={handleTranslate}>点击翻译</button>
    </>
  )
}
