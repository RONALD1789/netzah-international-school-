
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a teacher's assessment comment using the Gemini API.
 */
export const generateTeacherComment = async (
  categoryName: string, 
  skills: Record<string, string>, 
  studentName: string
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const skillSummary = Object.entries(skills)
      .map(([skill, grade]) => `- ${skill}: ${grade}`)
      .join("\n");

    const prompt = `You are a professional preschool teacher at Netzah International School. 
    Write a short, encouraging, and specific comment (2-3 sentences) for a student named ${studentName} for the category "${categoryName}".
    Here are their results (EE=Exceeds, ME=Meets, AE=Approaching, NI=Needs Improvement):
    ${skillSummary}
    The tone should be nurturing and professional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "The student is showing consistent progress in this area.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The student is showing consistent progress in this area.";
  }
};

/**
 * Drafts a professional response to a parent's message.
 */
export const draftParentResponse = async (
  parentMessage: string,
  studentName: string,
  teacherName: string
) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `You are ${teacherName}, a teacher at Netzah International School. 
    A parent of your student ${studentName} just sent you this message: "${parentMessage}"
    Draft a professional, warm, and helpful response. 
    Keep it concise (1-3 sentences) and align with the school motto "Nurturing & Training for Victory".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Thank you for your message. I will look into this and get back to you shortly.";
  } catch (error) {
    console.error("Gemini Response Draft Error:", error);
    return "Thank you for your message. I will get back to you soon.";
  }
};
