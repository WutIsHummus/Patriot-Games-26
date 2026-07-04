// Some models wrap JSON output in ```json fences even when response_format
// requests a json_object, and tool-use models (e.g. web search) sometimes
// prepend narration ("Let me search...") before the fence. Extract the
// fenced block or outermost {...} span from anywhere in the text.
export function parseLlmJson(content) {
  const text = String(content).trim()

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (fenced) {
    try {
      return JSON.parse(fenced[1])
    } catch {
      // fall through to brace-span extraction
    }
  }

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    return JSON.parse(text.slice(start, end + 1))
  }

  return JSON.parse(text)
}
