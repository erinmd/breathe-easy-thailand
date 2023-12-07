import { getAQByLocation } from './aqapi.js'
import { claudeForAq } from './claudeForAq.js'
import { claudeForLegislation } from './claude.js'

export const claudeResponse = async (incomingText) => {
  if (/zipcode/gi.test(incomingText)) {
    const zipcode = incomingText.match(/\d{5}/g)[0]
    const AQresults = await getAQByLocation(zipcode)
    const response = await claudeForAq(AQresults)
    return response
  } else {
    const response = await claudeForLegislation(incomingText)
    return response
  }
}
// console.log(await claudeResponse("Could you give me a short summary of the clean air act?"))
// console.log(await claudeResponse("How does the clean air act affect farmers?"))
// console.log(await claudeResponse("What is the air quality like near me? My zipcode is 10200"))
