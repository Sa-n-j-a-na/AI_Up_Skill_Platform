from openai import OpenAI

client = OpenAI(
  api_key="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"
)

response = client.responses.create(
  model="gpt-5-nano",
  input="write a haiku about ai",
  store=True,
)

print(response.output_text);
