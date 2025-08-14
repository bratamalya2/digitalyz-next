// app/api/generate-rule/route.js
import OpenAI from "openai";

export async function POST(req) {
  const {
    ruleName,
    ruleDescription,
    clientData,
    workerData,
    taskData,
    clientHeaders,
    workerHeaders,
    taskHeaders,
    clientHeadersDataType,
    workerHeadersDataType,
    taskHeadersDataType,
  } = await req.json();

  if (!ruleName || !ruleDescription) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing ruleName or ruleDescription",
      }),
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // This prompt tells GPT to generate a pure JS function that takes the datasets and returns updated datasets
  const prompt = `
You are a code generator.
You will receive the schema of three JSON datasets: clientData, workerData, taskData.
Each has a set of headers and data types.

clientData:
Headers: ${JSON.stringify(clientHeaders)}
Data types: ${JSON.stringify(clientHeadersDataType)}

workerData:
Headers: ${JSON.stringify(workerHeaders)}
Data types: ${JSON.stringify(workerHeadersDataType)}

taskData:
Headers: ${JSON.stringify(taskHeaders)}
Data types: ${JSON.stringify(taskHeadersDataType)}

The rule description is: "${ruleDescription}".

Generate ONLY JavaScript function code body (as a string) named "ruleFunction" with the following signature:

function ruleFunction(clientData, workerData, taskData) {
    // modify and return updated data
    return {
        clientData: updatedClientData,
        workerData: updatedWorkerData,
        taskData: updatedTaskData
    };
}

Rules:
- Do not include explanations or comments.
- The function must be valid JavaScript.
- Use only the given headers exactly as they appear.
- The function should implement the rule described in the ruleDescription.
- clientData, workerData, taskData will be arrays of objects.

Example output:
    const updatedClientData = clientData.filter(row => row.Status === "Active");
    const updatedWorkerData = workerData;
    const updatedTaskData = taskData;
    return { clientData: updatedClientData, workerData: updatedWorkerData, taskData: updatedTaskData };
`;

  try {
    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const ruleCode = completion.output[0].content[0].text.trim();

    const result = {
      ruleName,
      ruleDescription,
      ruleCode,
    };

    return new Response(
      JSON.stringify({
        success: true,
        ...result,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
      }
    );
  }
}
