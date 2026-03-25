# Intent: Deployment

## Goal
Enable the team to release tested application changes to users reliably, with minimal downtime and a clear path to rollback if a release introduces a regression.

## Stakeholders
- **Developer**: needs confidence that what they tested locally is what gets deployed — no surprises from environment differences
- **Operator / platform team**: needs deployments that are observable, repeatable, and recoverable without manual intervention
- **End user**: needs changes to appear without noticeable disruption or data loss

## Success Criteria
- [ ] A deployment can be initiated from a single command or pipeline trigger with no manual server steps
- [ ] A failed deployment can be rolled back to the previous working version within a defined time window
- [ ] Deployments are observable: the team can confirm which version is running in each environment at any time

## Behaviours <!-- taproot-managed -->
- [Deploy to Environment](./deploy-to-environment/usecase.md)

## Status
- **State:** active
- **Created:** 2026-03-25
