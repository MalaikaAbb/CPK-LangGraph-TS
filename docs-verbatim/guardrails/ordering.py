middleware=[
    InputFirewall(),        # outermost: screens before anything else runs
    OutputFirewall(),       # sees the final response last
    CopilotKitMiddleware(), # innermost: frontend tools, state exposure
]
