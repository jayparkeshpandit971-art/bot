> Ai Studioo:
Ai_Studio Owner:
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '8609039288:AAFMLDlmVTakzjEjJjK9od30kBCwwsjy3tk';
const GROQ_API_KEY = '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';
const GEMINI_API_KEY = 'AIzaSyCZ39UBl4gMgjCS5pRr70wvcKfC8h32XLU';
const OPENAI_API_KEY = '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';

const bot = new TelegramBot(token, { polling: true });

const OWNER_ID = @ai_dev_studioo;

let warnings = {};
let userMsgCount = {};
let lastMsgTime = {};

// 🔥 filters
const promoWords = ["dm","earn","money","promo","join","link","refer"];
const badWords = ["gali","madarchod","abuse"];

// ================= AI =================

async function checkGroq(text){
  try{
    const res = await axios.post("https://api.groq.com/openai/v1/chat/completions",{
      model:"llama3-70b-8192",
      messages:[
        {role:"system",content:"Reply YES or NO only"},
        {role:"user",content:Is this spam?\n${text}}
      ]
    },{
      headers:{
        Authorization:Bearer ${GROQ_API_KEY},
        "Content-Type":"application/json"
      }
    });

    return res.data.choices[0].message.content.toLowerCase().includes("yes");
  }catch(e){return null;}
}

async function checkGemini(text){
  try{
    const res = await axios.post(
      https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY},
      {
        contents:[{parts:[{text:Reply YES or NO only. Spam?\n${text}}] }]
      }
    );

    return res.data.candidates[0].content.parts[0].text.toLowerCase().includes("yes");
  }catch(e){return null;}
}

async function checkOpenAI(text){
  try{
    const res = await axios.post("https://api.openai.com/v1/chat/completions",{
      model:"gpt-4o-mini",
      messages:[
        {role:"system",content:"Reply YES or NO only"},
        {role:"user",content:Is this spam?\n${text}}
      ]
    },{
      headers:{
        Authorization:Bearer ${OPENAI_API_KEY},
        "Content-Type":"application/json"
      }
    });

    return res.data.choices[0].message.content.toLowerCase().includes("yes");
  }catch(e){return null;}
}

async function checkSpamAI(text){
  let res;

  res = await checkGroq(text);
  if(res !== null) return res;

  res = await checkGemini(text);
  if(res !== null) return res;

  res = await checkOpenAI(text);
  if(res !== null) return res;

  return false;
}

// ================= START =================

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 
╔═══❖ 🤖 AI STUDIO BOT❖═══╗

👋 Namaste!
Main hoon aapka Smart Security Bot 😎

👑 Owner: AI Studio (Sunny Pandit)

╚══════════════════════════════╝

🛡️ ADVANCED PROTECTION

┣➤ 🚫 Promotion auto delete  
┣➤ 💰 Scam detect  
┣➤ 📤 Forward block  
┣➤ 🤬 Abuse filter  
┣➤ 🔁 Spam control  
┗➤ ⚠️ 5 warnings → mute  

──────────────────────────────

⚙️ Add me in group & make admin 🚀
);
});

// ================= JOIN =================

bot.on('new_chat_members', (msg)=>{
  msg.new_chat_members.forEach(user=>{
    if(user.is_bot){
      bot.sendMessage(msg.chat.id,"👋 Thanks for adding me! Type /start");
    }
  });
});

// ================= MAIN =================

bot.on('message', async (msg)=>{
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text ? msg.text.toLowerCase() : "";

  if(msg.chat.type === "private") return;

  try{
    if(userId === OWNER_ID) return;

    const member = await bot.getChatMember(chatId,userId);
    if(member.status === "administrator" || member.status === "creator") return;

    let isSpam = false;

    // forward block
    if(msg.forward_from || msg.forward_from_chat){
      isSpam = true;
    }

    // flood detect
    const now = Date.now();
    if(!userMsgCount[userId]) userMsgCount[userId]=0;

    if(now - (lastMsgTime[userId] || 0) < 2000){
      userMsgCount[userId]++;
    } else {
      userMsgCount[userId]=1;
    }

    lastMsgTime[userId]=now;

    if(userMsgCount[userId] > 5){
      isSpam = true;
    }

> Ai Studioo:
// fast filter
    if(
      promoWords.some(w=>text.includes(w)) ||
      badWords.some(w=>text.includes(w)) ||
      text.includes("http") ||
      text.includes("www")
    ){
      isSpam = true;
    }

    // AI fallback
    if(!isSpam && text.length > 5){
      isSpam = await checkSpamAI(text);
    }

    if(isSpam){
      await bot.deleteMessage(chatId,msg.message_id);

      if(!warnings[userId]) warnings[userId]=0;
      warnings[userId]++;

      const btn = {
        reply_markup:{
          inline_keyboard:[
            [{text:"❌ Cancel Warning",callback_data:clear_${userId}}]
          ]
        }
      };

      bot.sendMessage(chatId,
        ⚠️ ${msg.from.first_name}\nWarning: ${warnings[userId]}/5,
        btn
      );

      if(warnings[userId]>=5){

        await bot.restrictChatMember(chatId,userId,{
          permissions:{can_send_messages:false},
          until_date: Math.floor(Date.now()/1000)+(24*60*60)
        });

        const muteBtn={
          reply_markup:{
            inline_keyboard:[
              [{text:"🔓 Unmute",callback_data:unmute_${userId}}]
            ]
          }
        };

        bot.sendMessage(chatId,
          🚫 ${msg.from.first_name} muted for 1 day,
          muteBtn
        );

        warnings[userId]=0;
      }
    }

  }catch(e){console.log(e);}
});

// ================= BUTTON =================

bot.on('callback_query', async (q)=>{
  const data=q.data;
  const chatId=q.message.chat.id;

  if(data.startsWith("clear_")){
    const uid=data.split("_")[1];
    warnings[uid]=0;
    bot.answerCallbackQuery(q.id,{text:"Warning cleared"});
  }

  if(data.startsWith("unmute_")){
    const uid=data.split("_")[1];

    await bot.restrictChatMember(chatId,uid,{
      permissions:{can_send_messages:true}
    });

    bot.answerCallbackQuery(q.id,{text:"User unmuted"});
  }
});

// ================= COMMAND =================

bot.onText(/\/unmute (\d+)/, async (msg,match)=>{
  await bot.restrictChatMember(msg.chat.id,match[1],{
    permissions:{can_send_messages:true}
  });
  bot.sendMessage(msg.chat.id,"Unmuted");
});

bot.onText(/\/clearwarn (\d+)/,(msg,match)=>{
  warnings[match[1]]=0;
  bot.sendMessage(msg.chat.id,"Warnings cleared");
});
