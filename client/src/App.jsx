import { useState } from "react";
import './App.css';
import didiAvatar from './assets/didi.png';


function App(){
  const [ message, setMessage] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = ()=>{
    if(!input.trim()) return;

    //user message

    const userMessage = {sender: 'user', text: input};

    const didiMessage = {
      sender: 'didi',
      text: 'typing',//later is replaced by real API response
    };

    setMessage([...message, userMessage, didiMessage]);
    setInput('');
  };

  return(
    <div className="container">
      <header>
        <img src={didiAvatar} alt="Didi" className="avatar" />
        <h1>Explain Like Didi</h1>
      </header>

      <div className="chat-box">
        {message.map((msg,i)=>(
          <div key={i} className={`bubble ${msg.sender}`}>
            <div className="msg">
              {msg.text == 'typing' ? (
                <div className="typing-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="input-bar">
        <input
          type="text"
          placeholder="पूछिए कुछ भी... (e.g. PF क्या होता है?)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="mic-button">
            🎤
        </button>


        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;