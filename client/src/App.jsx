import { useState } from "react";
import './App.css';
import didiAvatar from './assets/didi.png';
import axios from 'axios';

function App(){
  const [ message, setMessage] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = { sender: 'user', text: input };
  const didiTyping = { sender: 'didi', text: 'typing' };

  setMessage((prev) => [...prev, userMessage, didiTyping]);
  setInput('');

  try{
    //feature1: contextual history

    const filterMessages = message.filter(msg=> msg.text!=='typing');

    const chatHistory = [
      {
        role: 'user',
        parts: [{text: "तुम एक बड़ी बहन जैसी हो जो सरल भाषा में समझाती हो। हिंदी में बात करो।"}]
      },
      ...filterMessages.map((msg)=>({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{text: msg.text}]
      })),
      {
        role: 'user',
        parts: [{text: input}]
      }
    ];

    const response = await axios.post('http://localhost:5000/didi',{
      contents: chatHistory
    });

    const didiReply = response?.data?.reply || 'माफ करना, अभी मैं जवाब नहीं दे पा रही हूँ।';
    setMessage((prev)=> [...prev.slice(0,-1), {sender: 'didi', text: didiReply}]);
    console.log('Gemini response', response.data);
    
  }
  catch (error) {
      console.error('Gemini API error:', JSON.stringify(error.response?.data || error.message, null, 2));

      if (error.response?.status === 429) {
        setMessage((prev) => [...prev.slice(0, -1), { sender: 'didi', text: 'थोड़ी देर रुकिए, मैं अभी व्यस्त हूँ 😊' }]);
      } else {
        setMessage((prev) => [...prev.slice(0, -1), { sender: 'didi', text: 'माफ करना, कोई दिक्कत आ गई है।' }]);
      }
    }
};

const handleMicClick = () =>{
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'hi-IN';
  recognition.interimResults = false;
  recognition.onStart=()=>{
    setIsListening(true);
    console.log("🎤 Listening...");
    
  }

  recognition.onresult = (event) =>{
    const transcripts = event.results[0][0].transcript;
    console.log("🎧 Heard:", transcripts);
    setInput(transcripts);
    setIsListening(false);
  }

  recognition.onerror = (event)=>{
    console.error("Mic error: ", event.error);
    setIsListening(false);
    
  };

  recognition.onend = ()=>{
    setIsListening(false);
  };

  recognition.start();
}
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
        <button className= {`mic-button ${isListening ? 'glow' : ''}`} onClick={handleMicClick}>
            {isListening ? '🎙️...' : '🎤'}
        </button>


        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;