# API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Poultry Management API - Subscription Extension
  version: 1.0.0
  description: LemonSqueezy subscription integration endpoints extending existing poultry management API
servers:
  - url: https://your-app.vercel.app/api
    description: Production API
  - url: http://localhost:3000/api
    description: Development API

paths:
  /webhooks/lemonsqueezy:
    post:
      summary: LemonSqueezy webhook endpoint
      description: Processes subscription lifecycle events from LemonSqueezy
      security: []  # No auth required - webhook signature validation instead
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                meta:
                  type: object
                  properties:
                    event_name:
                      type: string
                      enum: [subscription_created, subscription_updated, subscription_cancelled, subscription_resumed, subscription_payment_success, subscription_payment_failed]
                    webhook_id:
                      type: string
                data:
                  type: object
                  properties:
                    id:
                      type: string
                    type:
                      type: string
                    attributes:
                      type: object
                      properties:
                        store_id:
                          type: number
                        customer_id:
                          type: number
                        order_id:
                          type: number
                        user_email:
                          type: string
                        status:
                          type: string
                        ends_at:
                          type: string
                        trial_ends_at:
                          type: string
                        billing_anchor:
                          type: number
      responses:
        200:
          description: Webhook processed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  processed_at:
                    type: string
        400:
          description: Invalid webhook payload
        401:
          description: Invalid webhook signature
        500:
          description: Webhook processing failed

  /subscription/status:
    get:
      summary: Get current user's subscription status
      description: Returns subscription details for authenticated user
      security:
        - bearerAuth: []
      responses:
        200:
          description: Subscription status retrieved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SubscriptionStatus'
        401:
          description: Not authenticated

  /subscription/upgrade-url:
    post:
      summary: Generate LemonSqueezy checkout URL
      description: Creates personalized upgrade URL for current user
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                plan_id:
                  type: string
                  description: LemonSqueezy product variant ID
                success_url:
                  type: string
                  description: Return URL after successful payment
      responses:
        200:
          description: Checkout URL generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  checkout_url:
                    type: string
                  expires_at:
                    type: string

  /subscription/customer-portal:
    get:
      summary: Get LemonSqueezy customer portal URL
      description: Returns URL for subscription management portal
      security:
        - bearerAuth: []
      responses:
        200:
          description: Customer portal URL retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  portal_url:
                    type: string
        404:
          description: No active subscription found

  /subscription/features:
    get:
      summary: Get feature access for current user
      description: Returns which features are available based on subscription
      security:
        - bearerAuth: []
      responses:
        200:
          description: Feature access retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  features:
                    type: object
                    additionalProperties:
                      $ref: '#/components/schemas/FeatureAccess'

  # Extended existing endpoint
  /getData:
    get:
      summary: Get all user data (Extended with subscription)
      description: Your existing unified data endpoint now includes subscription status
      security:
        - bearerAuth: []
      responses:
        200:
          description: User data with subscription information
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ExistingUserData'
                  - type: object
                    properties:
                      subscription:
                        $ref: '#/components/schemas/SubscriptionStatus'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    SubscriptionStatus:
      type: object
      properties:
        status:
          type: string
          enum: [free, active, cancelled, past_due, paused]
        is_premium:
          type: boolean
        subscription_id:
          type: string
          nullable: true
        plan_id:
          type: string
          nullable: true
        billing_email:
          type: string
          nullable: true
        subscription_start_date:
          type: string
          nullable: true
        subscription_end_date:
          type: string
          nullable: true
        next_billing_date:
          type: string
          nullable: true

    FeatureAccess:
      type: object
      properties:
        has_access:
          type: boolean
        requires_upgrade:
          type: boolean
        feature_name:
          type: string
        upgrade_prompt:
          type: string
          nullable: true

    ExistingUserData:
      type: object
      description: Your existing getData response structure (unchanged)
      properties:
        user:
          type: object
        flockProfiles:
          type: array
        eggEntries:
          type: array
        expenses:
          type: array
        # ... other existing data structures

    Error:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
            timestamp:
              type: string
            requestId:
              type: string
```
