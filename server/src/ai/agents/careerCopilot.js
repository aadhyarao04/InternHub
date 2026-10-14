import AIConversation from '../../models/AIConversation.js';
import AIMessage from '../../models/AIMessage.js';
import { executeControlledTool } from '../tools/controlledTools.js';
import { generateText } from '../services/aiProvider.js';
import { answerWithRAG } from '../rag/ragService.js';

export const handleCopilotChat = async (userId, userContext, messageText, conversationId = null) => {
  let conversation;
  if (conversationId) {
    conversation = await AIConversation.findOne({ _id: conversationId, userId });
  }

  if (!conversation) {
    conversation = await AIConversation.create({
      userId,
      title: messageText.slice(0, 40) + '...'
    });
  }

  // Record student message
  await AIMessage.create({
    conversationId: conversation._id,
    role: 'user',
    content: messageText
  });

  // Check intent for controlled tools
  const lowerMsg = messageText.toLowerCase();
  let toolData = null;
  let toolName = null;

  if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest internship') || lowerMsg.includes('what should i apply')) {
    toolName = 'getRecommendations';
    toolData = await executeControlledTool('getRecommendations', {}, userContext);
  } else if (lowerMsg.includes('search') || lowerMsg.includes('find internship') || lowerMsg.includes('remote internship')) {
    toolName = 'searchInternships';
    const isRemote = lowerMsg.includes('remote');
    toolData = await executeControlledTool('searchInternships', { workMode: isRemote ? 'REMOTE' : undefined }, userContext);
  } else if (lowerMsg.includes('my profile') || lowerMsg.includes('my skills')) {
    toolName = 'getStudentProfile';
    toolData = await executeControlledTool('getStudentProfile', {}, userContext);
  }

  // Retrieve RAG career context
  const ragResult = await answerWithRAG(messageText);

  // System instruction with strict guardrails
  const systemPrompt = `You are InternHub Career Copilot, an expert AI career and internship advisor.
CRITICAL SAFETY & TRUTH RULES:
1. You are assistive. You must NEVER claim an application has been submitted, accepted, rejected, or scheduled unless confirmed in the data.
2. You must NEVER fabricate company decisions, emails, or database records.
3. Help the student discover opportunities, understand requirements, close skill gaps, build resumes, and prepare for interviews.
4. If tool data is available, summarize it concisely and helpfully.`;

  const userPrompt = `Student says: "${messageText}"
${toolData ? `Verified Data Retrieved from InternHub System (${toolName}):\n${JSON.stringify(toolData, null, 2)}\n` : ''}
Relevant Career Guide Knowledge:\n${ragResult.answer}

Respond directly and warmly to the student with clear formatting, bullet points where helpful, and next action steps.`;

  let responseContent = await generateText(userPrompt, systemPrompt);

  if (!responseContent) {
    // Intelligent heuristic fallback
    if (toolName === 'getRecommendations' && Array.isArray(toolData) && toolData.length > 0) {
      const topPicks = toolData.slice(0, 3).map((r, i) => `${i + 1}. **${r.internship.title}** at ${r.internship.companyId?.name || 'Partner Company'} (${r.matchScore}% Match) - ${r.reasons.join(', ')}`).join('\n');
      responseContent = `Here are personalized internship recommendations based on your current skillset and preferences:\n\n${topPicks}\n\nWould you like me to analyze your skill gaps for any of these roles?`;
    } else if (toolName === 'searchInternships' && Array.isArray(toolData)) {
      const results = toolData.map((item, i) => `${i + 1}. **${item.title}** (${item.workMode}, ${item.location}) - Requires: ${item.requiredSkills.slice(0, 3).join(', ')}`).join('\n');
      responseContent = `I found the following open internship opportunities:\n\n${results}\n\nYou can view full details and apply directly through the Internships portal.`;
    } else {
      responseContent = ragResult.answer;
    }
  }

  // Save Assistant message to conversation history
  const assistantMsg = await AIMessage.create({
    conversationId: conversation._id,
    role: 'assistant',
    content: responseContent,
    toolCalls: toolName ? [{ toolName }] : [],
    toolResults: toolData ? [{ toolName, result: toolData }] : []
  });

  return {
    conversationId: conversation._id,
    message: assistantMsg
  };
};

export const getConversationHistory = async (userId, conversationId) => {
  const conversation = await AIConversation.findOne({ _id: conversationId, userId });
  if (!conversation) return null;
  const messages = await AIMessage.find({ conversationId }).sort({ createdAt: 1 });
  return { conversation, messages };
};

export const getUserConversations = async (userId) => {
  return await AIConversation.find({ userId }).sort({ updatedAt: -1 });
};

export default {
  handleCopilotChat,
  getConversationHistory,
  getUserConversations
};
