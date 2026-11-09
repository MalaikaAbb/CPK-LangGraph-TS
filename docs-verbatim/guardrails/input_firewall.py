from typing import Any

from langchain.agents.middleware import AgentMiddleware, AgentState, hook_config
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.runtime import Runtime


class InputFirewall(AgentMiddleware):
    """Rejects user input that fails policy before it reaches the model."""

    def __init__(self, *, refusal: str = "I can't help with that request."):
        super().__init__()
        self.refusal = refusal

    # can_jump_to declares the edge; without it, "jump_to" is ignored.
    @hook_config(can_jump_to=["end"])
    def before_model(
        self, state: AgentState, runtime: Runtime[Any]
    ) -> dict[str, Any] | None:
        messages = state.get("messages", [])
        latest = next(
            (m for m in reversed(messages) if isinstance(m, HumanMessage)), None
        )
        if latest is None:
            return None

        verdict = screen_input(str(latest.content))  # your classifier or rules
        if not verdict.allowed:
            # Ending with an AIMessage means the user sees the refusal in chat
            # rather than an error toast.
            return {
                "jump_to": "end",
                "messages": [AIMessage(content=self.refusal)],
            }

        return None
