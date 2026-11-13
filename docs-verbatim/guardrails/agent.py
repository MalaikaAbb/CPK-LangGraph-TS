from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
from langchain.agents.middleware import PIIMiddleware
from copilotkit import CopilotKitMiddleware

agent = create_agent(
    model=ChatOpenAI(model="gpt-6-luna", reasoning_effort="none"),
    tools=[...],
    middleware=[
        # Redact emails the user sends in.
        PIIMiddleware("email", strategy="redact"),
        # Mask card numbers wherever they appear, including in tool results.
        PIIMiddleware(
            "credit_card",
            strategy="mask",
            apply_to_output=True,
            apply_to_tool_results=True,
        ),
        # Refuse outright if an API key shows up.
        PIIMiddleware("api_key", detector=r"sk-[a-zA-Z0-9]{32}", strategy="block"),
        CopilotKitMiddleware(),
    ],
)
