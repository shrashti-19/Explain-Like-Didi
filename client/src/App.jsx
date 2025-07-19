import { useState, useRef, useEffect } from "react";
import './App2.css';
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

  // safe mode
  const [safeMode, setSafeMode] = useState(false);

  //motivational booster
  const [boostMode, setBoostMode] = useState(false);

  //saftey toolkit
  const [showToolKit, setShowToolKit] = useState(false);

  const chatEndRef = useRef(null);
  const [showPinnedOnly, setShowPinnedOnly]= useState(false);

  const [showGreeting, setShowGreeting] = useState(true);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  function cleanTextForSpeech(text) {
  // Remove emojis and most non-alphabetic symbols
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
             .replace(/[^a-zA-Z0-9\s\u0900-\u097F.,!?]/g, ''); // keeps Hindi and basic punctuation
  }

  const speakHindi= (text)=>{
  if(!window.speechSynthesis) return;
  const cleanText = cleanTextForSpeech(text);
  const utterance = new SpeechSynthesisUtterance(cleanText);
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
  const userMessage = { sender: 'user', text: input, time: timeStamp,tag: safeMode ? null : chatTag, pinned: false};
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
    const replyMessage = {sender: 'didi', text: didiReply, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), pinned: false};
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
     .filter(msg=> !msg.safe)
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
const BOOST_MESSAGES = [
  "✨ तुम बहुत काबिल हो, खुद पर भरोसा रखो!",
  "🚀 तुम ये कर सकती हो, मैं तुम्हारे साथ हूँ!",
  "🌟 अपने सपनों को सच करने की ताक़त तुममें है!",
];

const handleSummarize = async ()=>{
  const filterMessages = message.filter(msg =>msg.text!=='typing' && !msg.safe);
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

    let didiReply = response?.data?.reply || 'माफ करना, मैं अभी सारांश नहीं दे पा रही हूँ।';

    // if motivational mode is on
    if(boostMode){
      const didiMessageSoFar = message.filter(m=> m.sender === 'didi').length;
      if((didiMessageSoFar+1)%3===0){
        const randomBoost = BOOST_MESSAGES[Math.floor(Math.random() * BOOST_MESSAGES.length)];
        didiReply +="\n\n" + randomBoost;
      }
    }
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
  const parts = text.split(new RegExp(`(${searchTerm})`,'gi'));
  return parts.map((part,i)=>
    part.toLowerCase() === searchTerm.toLowerCase() ? <mark key={i}>{part}</mark>: part
  );
};

  return(
    <>
    {showGreeting ? (
      <div className="greeting-screen">
        <h1>नमस्ते! 😊</h1>
        <p>Explain Like Didi में आपका स्वागत है — यहाँ हर सवाल का सरल जवाब मिलेगा।</p>
        <button onClick={()=> setShowGreeting(false)}>चलो शुरू करें!</button>
      </div>
    ):(
     <div className={`app-wrapper ${isDarkMode ? 'dark' : ''}`}>
       <aside className = {`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <h3>🔍 Filters</h3>
        <button onClick={() => setFilterBy('all')} className={filterBy === 'all' ? 'active' : ''}>👥 All</button>
        <button onClick={() => setFilterBy('user')} className={filterBy === 'user' ? 'active' : ''}>🧑‍🎓 You</button>
        <button onClick={() => setFilterBy('didi')} className={filterBy === 'didi' ? 'active' : ''}>👩‍🏫 Didi</button>

        <h3>🏷️ Tags</h3>
        <button onClick={() => setTagFilter('all')} className={tagFilter === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setTagFilter('finance')} className={tagFilter === 'finance' ? 'active' : ''}>💰 Finance</button>
        <button onClick={() => setTagFilter('education')} className={tagFilter === 'education' ? 'active' : ''}>📚 Education</button>
        <button onClick={() => setTagFilter('personal')} className={tagFilter === 'personal' ? 'active' : ''}>👤 Personal</button>
        <button onClick={() => setTagFilter('other')} className={tagFilter === 'other' ? 'active' : ''}>🔖 Other</button>

        <h3>🔧 Options</h3>
        <label><input type="checkbox" checked={safeMode} onChange={() => setSafeMode(!safeMode)} /> 🛡️ Safe Mode</label>
        <label><input type="checkbox" checked={boostMode} onChange={() => setBoostMode(!boostMode)} /> 💪 Boost</label>
        <button onClick={() => setShowPinnedOnly(!showPinnedOnly)}>{showPinnedOnly ? '📄 All' : '📌 Pinned'}</button>
      </aside>
      
      
      <div className="main-content container">
       <header>
        <button class="sidebar-toggle"
        onClick={()=> setIsSidebarCollapsed(!isSidebarCollapsed)}
        >☰
        </button>

        <button className="scroll-toggle" onClick={()=> setAutoScroll(!autoScroll)}>
          {autoScroll ? '⏸️ Pause Scroll' : '▶️ Resume Scroll'}
        </button>
        <button className="theme-toggle" onClick={()=> setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? '🌞 Light' : '🌙 Dark'}
        </button>

        <button 
         className="toolkit-toggle"
         onClick={()=> setShowToolKit(!showToolKit)
         }
        >
          🛡️ सुरक्षा टूलकिट
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
      

        {showToolKit && (
        <div className="toolkit-box">
          <h3>🛡️ सुरक्षा और अधिकार टूलकिट</h3>
          <ul>
            <li>📞 <strong>महिला हेल्पलाइन:</strong>1091</li>
            <li>🚨 <strong>आपातकालीन सेवा:</strong>112</li>
            <li>📘 <strong>कानूनी अधिकार:</strong>शादी, काम, घरेलू हिंसा से संबंधित अधिकार</li>
            <li>🔐 <strong>ऑनलाइन सुरक्षा:</strong> सोशल मीडिया पर प्राइवेसी सेटिंग्स का ध्यान रखें</li>
            <li>🧠 <strong>हेल्थ टिप:</strong> मानसिक स्वास्थ्य भी जरूरी है - आत्म-संवाद करो ❤️</li>
          </ul>
        </div>
      )}
      

      
      


      <div className="chat-box">
        {message
        .filter(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterBy === 'all' || msg.sender === filterBy) &&
        (tagFilter === 'all' || msg.tag === tagFilter) &&
        (!showPinnedOnly || msg.pinned)
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
                  <div>
                    {highlightMatch(msg.text)}
                  </div>
                  <button 
                    className= {`pin-btn ${msg.pinned ? 'pinned' : ''}`}
                    onClick={()=>{
                      const updated = [...message];
                      updated[i].pinned = !updated[i].pinned;
                      setMessage(updated);
                    }}
                    title={msg.pinned ? "Unpin this message" : "Pin this message"}
                    >
                      📌
                    </button>
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

   
      <div className="feature-toggles">
        <label>
          <input
           type="checkbox"
           checked={safeMode}
           onChange={()=>setSafeMode(!safeMode)}
          />
          🛡️ Safe Mode (Ask anonymously)
        </label>
        <label>
          <input
           type="checkbox"
           checked = {boostMode}
           onChange={()=> setBoostMode(!boostMode)}
          />
          💪 Motivational Boost
        </label>
      </div>

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
  </div>
    )}
    </>
  );

}

export default App;