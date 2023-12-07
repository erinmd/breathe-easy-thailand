import {
  BedrockAgentRuntimeClient,
  RetrieveAndGenerateCommand,
  InvokeAgentCommand
} from '@aws-sdk/client-bedrock-agent-runtime'

export async function claudeForLegislation(textInput) {
  //takes config
  const client = new BedrockAgentRuntimeClient({ region: 'us-east-1' })

  const input = {
    // RetrieveAndGenerateRequest
    sessionId: client.sessionId,
    input: {
      // RetrieveAndGenerateInput
      text: textInput, // required
    },
    retrieveAndGenerateConfiguration: {
      // RetrieveAndGenerateConfiguration
      type: 'KNOWLEDGE_BASE', // required
      knowledgeBaseConfiguration: {
        // KnowledgeBaseRetrieveAndGenerateConfiguration
        knowledgeBaseId: 'DU8AKQDKAB', // required
        modelArn: `arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-v2`, // required
      },
    },
    sessionConfiguration: {
      // RetrieveAndGenerateSessionConfiguration
      kmsKeyArn:
        'arn:aws:kms:us-east-1:927304557361:key/c953b763-7e1c-4b70-9665-29c861bf0d2d', // required
    },
  }
  const command = new RetrieveAndGenerateCommand(input)
  const response = await client.send(command)
  return response.output.text
}

// claudeForLegislation(
//   `results = [
//     {
//       pm25: 17.4,
//       coordinates: '{"latitude":13.76415,"longitude":100.499077}'
//     },
//     {
//       pm25: 17.8,
//       coordinates: '{"latitude":13.76415,"longitude":100.499077}'
//     },
//     {
//       pm25: 21.6,
//       coordinates: '{"latitude":13.76415,"longitude":100.499077}'
//     }
//   ]
//   These are the pm25 recorded over the last 24 hours. Look at the pm25 values in these results, and put it into context of cigarettes smoked, 
//   given that 22mg is equivalent to 1 cigarette smoked in 24 hours. Write your response in a way targeting an audience aged 18-35, in persuasive 
//   language that air quality needs improving.
//   `
// )
