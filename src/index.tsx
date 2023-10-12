import * as esbuild from 'esbuild-wasm';
import React , {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom/client';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';
import CodeEditor from './components/code-editor';



const App = () => {

  const ref = useRef<any>();
  const iframe = useRef<any>();
  const [input, setInput] = useState('');
  

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
    });
  };

  useEffect(()=> {
    startService()
  },[]);

 

  const onClick = async () => {
    if(!ref.current)
    {
      return;
    }
    else
    {
      iframe.current.srcdoc = html;

      const result = await ref.current.build({
        entryPoints: ['index.js'],
        bundle: true,
        write: false,
        plugins: [unpkgPathPlugin(), fetchPlugin(input)],
        define: {
          'process.env.NODE_ENV': '"production"',
          global: 'window',
        }
      });

      iframe.current.contentWindow.postMessage(result.outputFiles[0].text, "*");      
    }
    
  };

  const html = `
    <html>
      <head></head>
      <body>
        <div id="root">
          <script>
            window.addEventListener('message', (event)=> {
              try{
                eval(event.data);
              } catch(err){
                const root = document.getElementById('root');
                root.innerHTML = '<div style="color: red"> <h4>Runtime Error</h4>'+ err +'</div>';
                console.error(err);
              }
            }, false);
          </script>
        </div>
      </body>
    <html>
  `;

  return(
    <div>
      <CodeEditor/>
      <textarea value={input} onChange={(e)=>setInput(e.target.value)}></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <iframe 
        title="preview" 
        ref={iframe} 
        sandbox="allow-scripts" 
        srcDoc={html}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

