from dataclasses import replace
from typing import Awaitable, Callable

from langchain.agents.middleware import (
    AgentMiddleware,
    ModelRequest,
    ModelResponse,
)
from langchain_core.messages import AIMessage


class OutputFirewall(AgentMiddleware):
    """Scrubs or blocks model output before it leaves the agent."""

    def wrap_model_call(
        self,
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
    ) -> ModelResponse:
        response = handler(request)

        scrubbed = []
        for message in response.result:
            if isinstance(message, AIMessage) and isinstance(message.content, str):
                clean = redact_sensitive(message.content)  # your DLP pass
                if clean != message.content:
                    message = message.model_copy(update={"content": clean})
            scrubbed.append(message)

        return replace(response, result=scrubbed)

    async def awrap_model_call(
        self,
        request: ModelRequest,
        handler: Callable[[ModelRequest], Awaitable[ModelResponse]],
    ) -> ModelResponse:
        response = await handler(request)
        # ...same scrubbing as above
        return response
