import KnowledgeDocument from '../../models/KnowledgeDocument.js';
import { generateEmbedding, cosineSimilarity } from '../embeddings/embeddingService.js';
import { generateText } from '../services/aiProvider.js';

export const searchKnowledge = async (queryText, category = null, limit = 3) => {
  const queryEmbedding = await generateEmbedding(queryText);
  const filter = category ? { category } : {};
  const docs = await KnowledgeDocument.find(filter).lean();

  const matches = [];

  for (const doc of docs) {
    if (doc.chunks && doc.chunks.length > 0) {
      for (const chunk of doc.chunks) {
        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
        matches.push({
          docTitle: doc.title,
          category: doc.category,
          text: chunk.text,
          score
        });
      }
    } else {
      // Document level comparison if chunks not precomputed
      const docEmbedding = await generateEmbedding(doc.content);
      const score = cosineSimilarity(queryEmbedding, docEmbedding);
      matches.push({
        docTitle: doc.title,
        category: doc.category,
        text: doc.content.slice(0, 500),
        score
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, limit);
};

export const answerWithRAG = async (question, category = null) => {
  const relevantChunks = await searchKnowledge(question, category, 3);
  const context = relevantChunks.map((c, i) => `[Source ${i + 1}: ${c.docTitle}]: ${c.text}`).join('\n\n');

  const prompt = `You are the InternHub AI Career Advisor. Answer the following student question using the provided verified career knowledge sources where relevant. If the sources do not cover the question completely, provide standard industry best practice guidance while remaining grounded and accurate.

Relevant Knowledge Context:
"""
${context || 'No specific knowledge base entry found.'}
"""

Student Question:
"${question}"

Provide a clear, actionable, structured answer with bullet points and source references if applicable.`;

  const systemInstruction = 'You are InternHub AI, an assistive career intelligence mentor. Help students prepare for internships, interviews, and resume building.';

  const aiAnswer = await generateText(prompt, systemInstruction);

  return {
    answer: aiAnswer || (relevantChunks.length > 0
      ? `Based on our career knowledge base (${relevantChunks[0].docTitle}):\n\n${relevantChunks[0].text}\n\nTip: Connect projects and measurable impact to highlight your skills.`
      : `InternHub AI Career Guidance: Prepare your resume with relevant coursework, personal projects with GitHub links, and review target role requirements regularly to close skill gaps.`),
    sources: relevantChunks.map(c => ({ title: c.docTitle, category: c.category, relevance: Math.round(c.score * 100) }))
  };
};

export default {
  searchKnowledge,
  answerWithRAG
};
