-- CreateIndex
CREATE INDEX "Property_status_type_approvedAt_idx" ON "Property"("status", "type", "approvedAt");

-- CreateIndex
CREATE INDEX "Property_ownerId_idx" ON "Property"("ownerId");

-- CreateIndex
CREATE INDEX "Property_agentId_idx" ON "Property"("agentId");

