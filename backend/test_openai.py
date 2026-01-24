from openai import OpenAI

client = OpenAI(api_key="")

response = client.responses.create(
    model="gpt-5-nano",
    input="say hello"
)

reply = response.output_text
print(reply)