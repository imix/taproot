# Behaviour: Deploy to Environment

## Actor
Developer or CI pipeline — promoting a tested build from one environment to the next (e.g. staging → production).

## Preconditions
- A build artifact or container image exists and has passed automated tests in the source environment
- The target environment is reachable and the deploying actor has sufficient permissions
- Any required environment-specific configuration (secrets, feature flags) is already in place

## Main Flow
1. Actor triggers a deployment for a specific build to the target environment
2. System applies the new build (container image, static bundle, or server package) to the target environment
3. System runs a health check or smoke test to confirm the new version is serving requests
4. System marks the deployment successful and the previous version is retained for rollback
5. Team can observe the running version via logs, a status endpoint, or a deployment dashboard

## Alternate Flows

### Rollback to previous version
- **Trigger:** The new deployment fails health checks or a regression is detected post-deploy
- **Steps:**
  1. Operator triggers a rollback (re-deploys the last known good artifact)
  2. System restores the previous version to the target environment
  3. System confirms health checks pass on the restored version
  4. Team investigates the regression in a non-production environment before re-attempting

### Zero-downtime deployment
- **Trigger:** The target environment requires uninterrupted availability during the deploy
- **Steps:**
  1. System starts new instances of the application alongside existing ones (blue-green or canary)
  2. Traffic is gradually or atomically shifted to the new version
  3. Old instances are terminated after health checks pass
  4. Rollback switches traffic back to old instances if checks fail

### Deploy to staging for preview
- **Trigger:** Developer wants to verify changes in a production-like environment before promoting
- **Steps:**
  1. Developer triggers deployment to staging with the candidate build
  2. Team reviews behaviour, runs exploratory tests, and approves
  3. Same artifact is promoted to production (no rebuild)

## Postconditions
- The target environment is running the specified build version
- The previous version artifact is retained and can be redeployed without a rebuild
- Deployment event is recorded (who deployed what, when, to which environment)

## Error Conditions
- **Health check fails after deploy**: System triggers automatic rollback; operator is notified with the failure reason
- **Insufficient permissions**: Deploy fails immediately with a clear error; no partial state is written to the environment

## Acceptance Criteria

**AC-1: Successful deploy serves the new version**
- Given a valid build artifact is available
- When a deployment to an environment is triggered
- Then the environment serves requests from the new version and health checks pass

**AC-2: Failed deployment rolls back automatically**
- Given a deployment whose health check fails after cutover
- When the system detects the failure
- Then the previous version is restored and the team is notified without manual intervention

**AC-3: Running version is identifiable at any time**
- Given a deployment has completed successfully
- When a developer queries the environment (e.g. via a `/version` endpoint or deployment log)
- Then the response identifies the exact build version currently running

## Status
- **State:** specified
- **Created:** 2026-03-25
