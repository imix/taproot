# Behaviour: Choose Plan

## Actor
New user after email verification

## Preconditions
- User account is verified
- Plans are configured in Stripe

## Main Flow
1. User is shown plan comparison page
2. User selects a plan
3. System processes payment via Stripe
4. Trial is activated

## Postconditions
- User has an active subscription or trial

## Error Conditions
- Payment failure: Show error and retry option

## Status
- **State:** implemented
- **Created:** 2024-02-01
- **Last reviewed:** 2024-03-01

## Notes
Trial activation tracked in trial-activation behaviour.
