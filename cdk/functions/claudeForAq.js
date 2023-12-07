import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';

const client = new AnthropicBedrock({
  // Authenticate by either providing the keys below or use the default AWS credential providers, such as
  // using ~/.aws/credentials or the "AWS_SECRET_ACCESS_KEY" and "AWS_ACCESS_KEY_ID" environment variables.
  awsAccessKey: process.env.AWS_SECRET_KEY,
  awsSecretKey: process.env.AWS_ACCESS_KEY,

  // awsRegion changes the aws region to which the request is made. By default, we read AWS_REGION,
  // and if that's not present, we default to us-east-1. Note that we do not read ~/.aws/config for the region.
  awsRegion: 'us-east-1',
});

export async function claudeForAq(aqResults) {
  const completion = await client.completions.create({
    model: 'anthropic.claude-v2:1',
    max_tokens_to_sample: 256,
    prompt: `${AnthropicBedrock.HUMAN_PROMPT} results = ${JSON.stringify(aqResults)}
      The results are an array of the pm25 recorded over the last 24 hours measured in micrograms per cubic meter. Take an average of the pm25 values in these results, and put it into context of cigarettes smoked, 
      given that 22 micrograms per cubic meteris equivalent to 1 cigarette smoked in 24 hours. Write your response in a way targeting an audience aged 18-35, in persuasive 
      language that air quality needs improving. Respond as if directly talking to the user who's location this is at.${AnthropicBedrock.AI_PROMPT}`,
  });
  return completion.completion
}

