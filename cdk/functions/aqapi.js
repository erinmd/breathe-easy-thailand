import axios from 'axios'
import { zipcodeData } from './data/zipcodeData.js'

const aqApi = axios.create({ baseURL: 'https://api.openaq.org/v2' })

export const getAQByLocation = async (zipcode) => {
  try {
    const coordinates = zipcodeToCoordinates(zipcode)
    const time24HoursAgo = new Date(Date.now())
    time24HoursAgo.setHours(time24HoursAgo.getHours() + 7 - 24)
    const result = await aqApi.get(
      `/measurements?date_from=${time24HoursAgo.toISOString()}&parameter=pm25&coordinates=${coordinates}`
    )
    const refinedResults = result.data.results.map((resultObject) => {
      return resultObject.value
    })
    return refinedResults
  } catch (error) {
    console.log(error)
  }
}

export const zipcodeToCoordinates = (zipcode) => {
  try {
    const coordinateObject = zipcodeData.find((zipcodeObject) => {
      return zipcodeObject.zip === zipcode
    })
    return coordinateObject.lat + ',' + coordinateObject.lng
  } catch (error) {
    throw 'invalid zipcode'
  }
}

// const getAQByLocationDescription = `
// <tool_description>
// <tool_name>get_AQ_by_location</tool_name>
// <description>
// Returns pm25 data and nearest location it has been measured over the last 24 hours for given zipcode.
// </description>
// <parameters>
// <parameter>
// <name>pm25</name>
// <type>number</type>
// <description>The pm25 measured in micrograms per cubic meter</description>
// </parameter>
// <parameter>
// <name>coordinates<name>
// <type>string</type>
// <description>The latitude and longitude of the location the pm25 was measured</description>
// </parameter>
// </parameters>
// </tool_description>
// `

// const tools = { getAQByLocation }
// const listOfToolSpecs = [getAQByLocationDescription]

// const createPrompt = (toolsString, userInput) => {
//   const promptTemplate = `
//     In this environment you have access to a set of tools you can use to answer ther user's question.
//     You may call them like this. Only invoke one function at a time and wait for the results before invoking another function:
//     <function_calls>
//     <invoke>
//     <tool_name>$TOOL_NAME</tool_name>
//     <parameters>
//     <$PARAMETER_NAME>$PARAMETER_VALUE</$PARAMETER_NAME>
//     ...
//     </parameters>
//     </invoke>
//     </function_calls>

//     Here are the tools available:
//     <tools>
//     ${toolsString}
//     </tools>

//     Human:
//     ${userInput}

//     Assistant:`

//   return promptTemplate
// }

// const addTools = () => {
//   let toolsString = ''
//   for (const toolsSpec of listOfToolSpecs) {
//     toolsString += toolsSpec
//   }
// }

// const callFunction = (toolName, parameters) => {
//   const output = tools[toolName](...parameters)
//   return output
// }

// const formatResult = (toolName, output) => {
//   return `
//     <function_results>
// <result>
// <tool_name>${tool_name}</tool_name>
// <stdout>
// ${output}
// </stdout>
// </result>
// </function_results>
//     `
// }

// const etreeToObject = () => {
//   // Need to figure this bit out
// }

// const runLoop = (prompt) => {
//   console.log(prompt)
//   while (true) {
//     const bedrock = boto3.client((service_name = 'bedrock-runtime'))
//     const modelId = 'anthropic.claude-v2'
//     const body = JSON.stringify({
//       prompt: prompt,
//       stop_sequences: ['\n\nHuman:', '</function_calls>'],
//       max_tokens_to_sample: 700,
//       temperature: 0,
//     })
//     const accept = 'application/json'
//     const contentType = 'application/json'
//     // bedrock api call with prompt
//     const partial_completion = bedrock.invoke_model(body, modelId, accept, contentType)
//   }
// }
