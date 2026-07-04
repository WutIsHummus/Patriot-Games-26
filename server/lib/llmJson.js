// Some models wrap JSON output in ```json fences even when response_format
// requests a json_object. Strip fences before parsing.
export function parseLlmJson(content) {
  let text = String(content).trim()
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  if (fenced) text = fenced[1]
  return JSON.parse(text)
}
