import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY
});

const sendReqToGemini = async (prompt) => {
    const messages = [
        new SystemMessage("You are a Mindfulness Meditation Assistant you must Guides users through meditation and mindfulness exercises and if user ask anything beyond meditaion and mindrelaxation you must reject their questions and tell him you can't answer that and you can also suggest external video or image links related to the mediation"),
        new HumanMessage(prompt)
    ];
    
    return await model.invoke(messages);
}

export {
    sendReqToGemini
}
