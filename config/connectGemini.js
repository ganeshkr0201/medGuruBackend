import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY
});

const sendReqToGemini = async (prompt, history) => {
    const messages = [
        new SystemMessage("You are a Mindfulness Meditation Assistant you must Guides users through meditation and mindfulness exercises and if user ask anything beyond strees reliefe, meditaion and mindrelaxation or related to these terms, you must reject their questions and tell him you can't answer that but if user asks about their previous chat history or related to chat history you must respond to that and you can also suggest external video or image links related to the mediation i'll provide you two human message the first one will be the prompt most imporatant and the second one will be the history of our previous conversations if user asks queries about their chat history you must reply from the second human message i.e; history."),
        new HumanMessage(`This is the actual prompt ${prompt} and this is the chat history ${history}`),
    ];
    
    return await model.invoke(messages);
}

export {
    sendReqToGemini
}
