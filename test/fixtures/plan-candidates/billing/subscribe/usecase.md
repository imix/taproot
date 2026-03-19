# UseCase: Subscribe to Plan

## Actor
Authenticated user

## Preconditions
- User has a verified account
- Stripe is configured

## Main Flow
1. User selects a plan
2. User enters payment details
3. System processes payment via Stripe
4. Subscription is activated

## Alternate Flows
- **Payment declined**: show error and allow retry

## Error Conditions
- **Stripe unavailable**: show service unavailable message

## Postconditions
- User has an active subscription

## Status
- **State:** implemented
- **Created:** 2026-01-01
