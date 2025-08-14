import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 seconds timeout
});

export async function POST(req) {
  const { columns, filterPrompt,dataTypes } = await req.json();

  if (!columns || !Array.isArray(columns) || !filterPrompt) {
    return new Response(JSON.stringify({ success: false, error: "Invalid input" }), {
      status: 400,
    });
  }

  const prompt = `
You are a code generator.  
Given these column names: ${JSON.stringify(columns)}
The data structure of the respective columns: ${JSON.stringify(dataTypes)}
Generate a JavaScript filter function that accepts a row object and returns true if the row matches the condition described below.  

Condition (in plain English): "${filterPrompt}"

Rules:
- Only return valid JavaScript function code.
- Use "row" as the function parameter.
- Only reference the provided column names exactly as they appear.
- Do not add comments or explanations.

Example output: row.Status === "Active" && row.Amount > 5000
`;

  try {
    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const filterCode = completion.output[0].content[0].text.trim();

    return new Response(JSON.stringify({ success: true, filterCode }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
    });
  }
}
