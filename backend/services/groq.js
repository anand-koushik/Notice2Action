import dotenv from 'dotenv';

dotenv.config();

// Helper to check for the Groq API key
const getGroqApiKey = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set. Please set it in backend/.env');
  }
  return apiKey;
};

/**
 * Analyzes a notice (text or image) using Groq API (OpenAI-compatible) with JSON output.
 * @param {Object} input
 * @param {string} input.content - The text content or base64 representation of the image
 * @param {string} input.fileType - 'text' or 'image' (PDF is converted to text beforehand)
 * @param {string} [input.mimeType] - The MIME type for images
 */
export async function analyzeNotice({ content, fileType, mimeType }) {
  const apiKey = getGroqApiKey();
  
  // qwen/qwen3.8-27b for high-quality vision/image analysis, openai/gpt-oss-120b for text reasoning
  const modelName = fileType === 'image' ? 'qwen/qwen3.8-27b' : 'openai/gpt-oss-120b';

  const systemPrompt = `You are an expert AI assistant that specializes in converting long, complex official notices (from government, colleges, corporates, etc.) into simple, clear, and actionable information.
You must output a single JSON object. The JSON object must strictly follow this structure:
{
  "title": "A concise, descriptive, and official-sounding title for the notice",
  "summary": "A clear, professional summary of the notice explaining what it is about and its purpose. Use markdown formatting like bullet points or bold text where appropriate to make it highly readable.",
  "deadlines": [
    {
      "task": "The specific event, task, action, or submission associated with this deadline.",
      "date": "The specific deadline date and time, formatted nicely (e.g., Oct 15, 2026, 5:00 PM) or 'Not specified'.",
      "originalText": "The direct quote or sentence from the notice mentioning this deadline."
    }
  ],
  "eligibility": [
    "List of criteria, qualifications, prerequisites, or target audience for the notice."
  ],
  "checklist": [
    {
      "task": "Action to take, starting with an active verb (e.g., 'Fill out Form A', 'Submit resume').",
      "dueDate": "Specific deadline for this checklist item, or 'Not specified'."
    }
  ]
}

Only return the raw JSON object, without markdown block wrappers or conversational text. Make sure all JSON formatting is strictly valid.`;

  const userMessages = [];

  if (fileType === 'text') {
    userMessages.push({
      role: 'user',
      content: `Analyze the following notice and extract the requested fields into JSON format:\n\nNotice Content:\n${content}`
    });
  } else {
    // For images, we send image_url base64 representation
    userMessages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Analyze this notice image and extract the requested fields into JSON format.'
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${content}`
          }
        }
      ]
    });
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        ...userMessages
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API Error Response:', errorText);
    throw new Error(`Groq API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const responseText = data.choices[0].message.content;

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Failed to parse Groq JSON output:', responseText);
    throw new Error('Groq API did not return valid JSON. Response was: ' + responseText);
  }
}
