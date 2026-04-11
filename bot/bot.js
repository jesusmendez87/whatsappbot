import { getFlowResponse } from './flows.js'

export function handleMessage(text) {
  const clean = text.toLowerCase().trim()

  return getFlowResponse(clean) 
}