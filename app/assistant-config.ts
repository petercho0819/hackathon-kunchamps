export let assistantId = "asst_djp5Eq8VBQ9ePDw4lwsv4qBL"; // set your assistant ID here

if (assistantId === "") {
  assistantId = process.env.OPENAI_ASSISTANT_ID;
}
