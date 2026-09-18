const result = await graph.invoke(input, {
  context: { tenantId: verifiedTenantId },
  recursionLimit: 50,
});