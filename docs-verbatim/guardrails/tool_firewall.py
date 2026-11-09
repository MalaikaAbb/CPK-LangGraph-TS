from langgraph.types import Command
from langchain_core.messages import ToolMessage
from langchain.agents.middleware import ToolCallRequest


class ToolFirewall(AgentMiddleware):
    def wrap_tool_call(
        self,
        request: ToolCallRequest,
        handler: Callable[[ToolCallRequest], ToolMessage | Command],
    ) -> ToolMessage | Command:
        if not tool_call_allowed(request):  # your policy
            return ToolMessage(
                content="This action is not permitted.",
                tool_call_id=request.tool_call["id"],
            )
        return handler(request)
