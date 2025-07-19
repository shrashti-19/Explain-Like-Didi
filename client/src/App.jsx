import { useState, useRef, useEffect } from "react";
import './App.css';
import didiAvatar from './assets/didi.png';
import axios from 'axios';

function App(){
  const [ message, setMessage] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDarkMode, setIsDarkMode]= useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  //tagging of chat
  const [chatTag, setChatTag] = useState('');
  const [tagFilter, setTagFilter] = useState('all');

  const chatEndRef = useRef(null);

  const speakHindi= (text)=>{
  if(!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate=1;
  utterance.pitch=1;
  utterance.onstart = () => setIsSpeaking(true);
  utterance.onend = () =>setIsSpeaking(false);

  speechSynthesis.speak(utterance);
  setLastSpokenText(text);
};
  const handleReplay = ()=>{
    if(lastSpokenText){
      speakHindi(lastSpokenText);
    }
  };

  const handleStop= ()=>{
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };


  const handleSend = async () => {
    speechSynthesis.cancel();

  if (!input.trim()) return;

  const timeStamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  const userMessage = { sender: 'user', text: input, time: timeStamp,tag: chatTag};
  const didiTyping = { sender: 'didi', text: 'typing', time: '' };


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
    const replyMessage = {sender: 'didi', text: didiReply, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})};
    setMessage((prev)=> [...prev.slice(0,-1), replyMessage]);
    speakHindi(didiReply);
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

  useEffect(()=>{
    if(autoScroll){
      chatEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }
  },[message, autoScroll]);

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

const handleDownload = ()=>{
  const chatText = message
     .map(msg=> `${msg.sender === 'user' ? '🧑‍🎓 You' : '👩‍🏫 Didi'}: ${msg.text}`)
     .join('\n\n');

  const blob = new Blob([chatText], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'didi_chat.txt';
  a.click();

  URL.revokeObjectURL(url);
}

//summarize handler 
const handleSummarize = async ()=>{
  const filterMessages = message.filter(msg =>msg.text!=='typing');
  if(filterMessages.length===0){
    alert("कोई चैट नहीं है जिसे समझाया जा सके।");
    return;
  }

  const chatHistory = [
    {
      role:'user',
      parts: [{text: "तुम एक बड़ी बहन जैसी हो जो सरल भाषा में समझाती हो। हिंदी में बात करो।"}]
    },
    ...filterMessages.map(msg=>({
      role: msg.sender === 'user' ? 'user': 'model',
      parts: [{text: msg.text}]
    })),

    {
      role: 'user',
      parts: [{text : "ऊपर के पूरे चैट को सरल भाषा में समझाओ।"}]
    }
  ];

  setMessage(prev=> [...prev, {sender: 'didi', text: 'typing', time: ''}]);
  try{
    const response = await axios.post('http://localhost:5000/didi',{
      contents: chatHistory
    });

    const didiReply = response?.data?.reply || 'माफ करना, मैं अभी सारांश नहीं दे पा रही हूँ।';
    const replyMessage = {
      sender: 'didi',
      text: didiReply,
      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    };

    setMessage(prev=>[...prev.slice(0,-1),replyMessage]);
    speakHindi(didiReply);
  }catch(error){
    console.error("Gemini error:", error);
    setMessage(prev=>[...prev.slice(0,-1),{
      sender: 'didi',
      text: 'माफ करना, कोई समस्या आ गई है।',
      time: ''
    }]);
    
  }
};


const highlightMatch = (text)=>{
  if(!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

  return(
    <div className={`container ${isDarkMode ? 'dark' : ''}`}>
      <header>
        <button className="scroll-toggle" onClick={()=> setAutoScroll(!autoScroll)}>
          {autoScroll ? '⏸️ Pause Scroll' : '▶️ Resume Scroll'}
        </button>
        <button className="theme-toggle" onClick={()=> setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? '🌞 Light' : '🌙 Dark'}
        </button>

        <img src={didiAvatar} alt="Didi" className="avatar" />
        <h1>Explain Like Didi</h1>
      </header>
      <div className="search-bar">
        <input
         type="text"
         placeholder="संदेशों में खोजें..."
         value={searchTerm}
         onChange={(e)=> setSearchTerm(e.target.value)}
         />
      </div>
      <div className="filter-button">
        <button onClick={()=> setFilterBy('all')} className= {filterBy === 'all' ? 'active' : ''}>👥 All</button>
        <button onClick={()=> setFilterBy('user')} className= {filterBy === 'user' ? 'active' : ''}>🧑‍🎓 You</button>
        <button onClick={()=> setFilterBy('didi')} className= {filterBy === 'didi' ? 'active' : ''}>👩‍🏫 Didi</button>
      </div>
      <div className="tag-filter">
        <span>🎯 Filter by tag:</span>
        <button onClick={()=> setTagFilter('all')} className={tagFilter==='all' ? 'active' : ''}>All</button>
        <button onClick={()=> setTagFilter('finance')} className={tagFilter==='finance' ? 'active' : ''}>💰 Finance</button>
        <button onClick={()=> setTagFilter('all')} className={tagFilter==='education' ? 'active' : ''}>📚 Education</button>
        <button onClick={()=> setTagFilter('all')} className={tagFilter==='personal' ? 'active' : ''}>👤 Personal</button>
        <button onClick={()=> setTagFilter('all')} className={tagFilter==='other' ? 'active' : ''}>🔖 Other</button>

      </div>
      <div className="chat-box">
        {message
        .filter(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterBy === 'all' || msg.sender === filterBy) &&
        (tagFilter === 'all' || msg.tag === tagFilter)
      )
        .map((msg,i)=>(
          <div key={i} className={`bubble ${msg.sender}`}>
            <div className="msg">
              {msg.text == 'typing' ? (
                <div className="typing-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              ) : (
                <>
                  <div
                   dangerouslySetInnerHTML={{__html: highlightMatch(msg.text)}}
                  />
                {msg.sender === 'didi' && (
                  <button
                  className="copy-btn"
                  onClick={()=> navigator.clipboard.writeText(msg.text)}
                  title="कॉपी करें"
                  >
                    📋
                  </button>
                )}
                {msg.tag && <div className="chat-tag">🏷️ {msg.tag}</div>}
                {msg.time && <div className="timestamp">{msg.time}</div>}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef}/>
      </div>

      <select 
        value={chatTag}
        onChange={(e)=> setChatTag(e.target.value)}
        className="tag-select"
      >
        <option value="">🗂️ Tag this chat...</option>
        <option value="finance">💰 Finance</option>
        <option value="education">📚 Education</option>
        <option value="personal">👤 Personal</option>
        <option value="other">🔖 Other</option>

      </select>
      <div className="input-bar">
        <input
          type="text"
          placeholder="पूछिए कुछ भी... (e.g. PF क्या होता है?)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e)=>{
            if(e.key === 'Enter') handleSend()
          }}
        />
        <button className= {`mic-button ${isListening ? 'glow' : ''}`} onClick={handleMicClick}>
            {isListening ? '🎙️...' : '🎤'}
        </button>


        <button onClick={handleSend}>Send</button>
        <button onClick={handleReplay} disabled={!lastSpokenText}>
            🔈 Listen Again
        </button>

        <button onClick={handleStop} disabled={!isSpeaking}>
            ⏹️ Stop
        </button>
        <button onClick={handleDownload}>
           📥 Save Chat
        </button>
        <button onClick={handleSummarize}>
           🧠 समझाओ पूरा चैट
        </button>
      </div>
    </div>
  );
}

export default App;