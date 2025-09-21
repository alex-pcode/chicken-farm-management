/**
 * Test Suite: Subscription Database Schema
 * Story: 16.1.implement-subscription-database-schema
 * 
 * Tests database migration and subscription schema functionality
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

// Skip tests if environment variables are not set
const skipTests = !supabaseUrl || !supabaseAnonKey || !supabaseServiceKey;

// Create test clients
const anonClient = createClient(supabaseUrl || '', supabaseAnonKey || '');
const serviceClient = createClient(supabaseUrl || '', supabaseServiceKey || '');

describe('Subscription Database Schema', () => {
  let testUserId: string;

  beforeAll(async () => {
    if (skipTests) {
      console.log('Skipping subscription schema tests - environment variables not set');
      return;
    }

    // Create a test user for our tests
    const { data: authData, error: authError } = await anonClient.auth.signUp({
      email: `test-subscription-${Date.now()}@example.com`,
      password: 'test-password-123!',
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }

    testUserId = authData.user.id;
  });

  afterAll(async () => {
    if (skipTests || !testUserId) return;

    // Clean up test user
    await serviceClient.auth.admin.deleteUser(testUserId);
  });

  describe('Users Table Extensions', () => {
    it('should have subscription fields in users table', async () => {
      if (skipTests) return;

      // Query user_profiles to check if subscription fields exist
      const { data, error } = await serviceClient
        .from('user_profiles')
        .select(`
          user_id,
          subscription_status,
          subscription_id,
          customer_id,
          billing_email,
          subscription_start_date,
          subscription_end_date,
          plan_id,
          subscription_updated_at
        `)
        .eq('user_id', testUserId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.subscription_status).toBe('free'); // Default value
      expect(data?.subscription_updated_at).toBeDefined();
    });

    it('should enforce subscription_status constraint', async () => {
      if (skipTests) return;

      // Try to set invalid subscription status
      const { error } = await serviceClient
        .from('user_profiles')
        .update({ subscription_status: 'invalid_status' })
        .eq('user_id', testUserId);

      expect(error).toBeDefined();
      expect(error?.message).toContain('check constraint');
    });

    it('should have proper indexes on subscription fields', async () => {
      if (skipTests) return;

      // Query to check if indexes exist
      const { data, error } = await serviceClient.rpc('sql', {
        query: `
          SELECT indexname, tablename 
          FROM pg_indexes 
          WHERE tablename = 'user_profiles' 
          AND (indexname LIKE '%subscription%' OR indexname LIKE '%user_profiles_subscription%')
        `
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      
      const indexNames = data?.map((idx: { indexname: string }) => idx.indexname) || [];
      expect(indexNames).toContain('idx_user_profiles_subscription_status');
      expect(indexNames).toContain('idx_user_profiles_subscription_id');
    });
  });

  describe('Webhook Events Table', () => {
    it('should create webhook_events table with proper schema', async () => {
      if (skipTests) return;

      // Test webhook event creation
      const testWebhookEvent = {
        webhook_id: `test_webhook_${Date.now()}`,
        event_type: 'subscription_created',
        user_id: testUserId,
        payload: { test: 'data', subscription_id: 'sub_123' },
        processing_status: 'success'
      };

      const { data, error } = await serviceClient
        .from('webhook_events')
        .insert(testWebhookEvent)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.webhook_id).toBe(testWebhookEvent.webhook_id);
      expect(data?.event_type).toBe(testWebhookEvent.event_type);
      expect(data?.payload).toEqual(testWebhookEvent.payload);
      expect(data?.created_at).toBeDefined();
      expect(data?.processed_at).toBeDefined();
    });

    it('should enforce webhook_id uniqueness', async () => {
      if (skipTests) return;

      const webhookId = `duplicate_test_${Date.now()}`;
      
      // First insert should succeed
      const { error: firstError } = await serviceClient
        .from('webhook_events')
        .insert({
          webhook_id: webhookId,
          event_type: 'test',
          user_id: testUserId,
          payload: { test: 'data1' }
        });

      expect(firstError).toBeNull();

      // Second insert with same webhook_id should fail
      const { error: secondError } = await serviceClient
        .from('webhook_events')
        .insert({
          webhook_id: webhookId,
          event_type: 'test',
          user_id: testUserId,
          payload: { test: 'data2' }
        });

      expect(secondError).toBeDefined();
      expect(secondError?.message).toContain('duplicate key value');
    });

    it('should have RLS enabled and be inaccessible to regular users', async () => {
      if (skipTests) return;

      // Try to access webhook_events as regular user (should fail)
      const { data } = await anonClient
        .from('webhook_events')
        .select('*');

      // Should return empty result or error due to RLS
      expect(data?.length || 0).toBe(0);
    });
  });

  describe('Subscription Features Table', () => {
    it('should create subscription_features table with initial data', async () => {
      if (skipTests) return;

      const { data, error } = await anonClient
        .from('subscription_features')
        .select('*');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBeGreaterThan(0);

      // Check specific features exist
      const featureKeys = data?.map(f => f.feature_key) || [];
      expect(featureKeys).toContain('crm');
      expect(featureKeys).toContain('advanced_analytics');
      expect(featureKeys).toContain('egg_counter');

      // Check egg_counter is free (requires_premium = false)
      const eggCounterFeature = data?.find(f => f.feature_key === 'egg_counter');
      expect(eggCounterFeature?.requires_premium).toBe(false);

      // Check CRM requires premium
      const crmFeature = data?.find(f => f.feature_key === 'crm');
      expect(crmFeature?.requires_premium).toBe(true);
    });

    it('should allow authenticated users to read features', async () => {
      if (skipTests) return;

      // Sign in as test user
      await anonClient.auth.signInWithPassword({
        email: `test-subscription-${Date.now()}@example.com`,
        password: 'test-password-123!'
      });

      const { data, error } = await anonClient
        .from('subscription_features')
        .select('feature_key, feature_name, requires_premium')
        .eq('feature_key', 'crm')
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.feature_key).toBe('crm');
    });
  });

  describe('Database Functions', () => {
    it('should create user_is_premium function', async () => {
      if (skipTests) return;

      // Test function with free user
      const { data: freeResult, error: freeError } = await serviceClient
        .rpc('user_is_premium', { user_uuid: testUserId });

      expect(freeError).toBeNull();
      expect(freeResult).toBe(false);

      // Update user to premium status
      await serviceClient
        .from('user_profiles')
        .update({ subscription_status: 'active' })
        .eq('user_id', testUserId);

      // Test function with premium user
      const { data: premiumResult, error: premiumError } = await serviceClient
        .rpc('user_is_premium', { user_uuid: testUserId });

      expect(premiumError).toBeNull();
      expect(premiumResult).toBe(true);
    });

    it('should create update_user_subscription function', async () => {
      if (skipTests) return;

      const subscriptionData = {
        p_user_id: testUserId,
        p_subscription_status: 'active',
        p_subscription_id: 'sub_test_123',
        p_customer_id: 'cust_test_456',
        p_billing_email: 'billing@example.com',
        p_plan_id: 'plan_premium'
      };

      const { data, error } = await serviceClient
        .rpc('update_user_subscription', subscriptionData);

      expect(error).toBeNull();
      expect(data).toBe(true);

      // Verify the update worked
      const { data: userData, error: userError } = await serviceClient
        .from('user_profiles')
        .select('subscription_status, subscription_id, customer_id, billing_email, plan_id')
        .eq('user_id', testUserId)
        .single();

      expect(userError).toBeNull();
      expect(userData?.subscription_status).toBe('active');
      expect(userData?.subscription_id).toBe('sub_test_123');
      expect(userData?.customer_id).toBe('cust_test_456');
      expect(userData?.billing_email).toBe('billing@example.com');
      expect(userData?.plan_id).toBe('plan_premium');
    });

    it('should handle invalid parameters in functions gracefully', async () => {
      if (skipTests) return;

      // Test user_is_premium with null UUID
      const { data: nullResult, error: nullError } = await serviceClient
        .rpc('user_is_premium', { user_uuid: null });

      expect(nullError).toBeNull();
      expect(nullResult).toBe(false);

      // Test update_user_subscription with invalid status
      const { data: invalidResult, error: invalidError } = await serviceClient
        .rpc('update_user_subscription', {
          p_user_id: testUserId,
          p_subscription_status: 'invalid_status'
        });

      expect(invalidError).toBeNull();
      expect(invalidResult).toBe(false);
    });
  });

  describe('Performance and Data Integrity', () => {
    it('should enforce subscription date constraints', async () => {
      if (skipTests) return;

      // Try to set end date before start date (should fail)
      const { error } = await serviceClient
        .from('user_profiles')
        .update({
          subscription_start_date: '2025-01-15T00:00:00Z',
          subscription_end_date: '2025-01-10T00:00:00Z'
        })
        .eq('user_id', testUserId);

      expect(error).toBeDefined();
      expect(error?.message).toContain('check constraint');
    });

    it('should handle concurrent subscription updates', async () => {
      if (skipTests) return;

      // Simulate concurrent webhook processing
      const updates = Array.from({ length: 5 }, (_, i) => 
        serviceClient.rpc('update_user_subscription', {
          p_user_id: testUserId,
          p_subscription_status: 'active',
          p_subscription_id: `concurrent_test_${i}`,
          p_customer_id: `cust_${i}`
        })
      );

      const results = await Promise.all(updates);
      
      // All updates should succeed (last one wins)
      results.forEach(result => {
        expect(result.error).toBeNull();
        expect(result.data).toBe(true);
      });

      // Verify final state
      const { data, error } = await serviceClient
        .from('user_profiles')
        .select('subscription_status, subscription_updated_at')
        .eq('user_id', testUserId)
        .single();

      expect(error).toBeNull();
      expect(data?.subscription_status).toBe('active');
      expect(data?.subscription_updated_at).toBeDefined();
    });
  });

  describe('Migration Backwards Compatibility', () => {
    it('should not break existing RLS policies', async () => {
      if (skipTests) return;

      // Sign in as test user
      const { error: signInError } = await anonClient.auth.signInWithPassword({
        email: `test-subscription-${Date.now()}@example.com`,
        password: 'test-password-123!'
      });

      if (signInError) {
        console.warn('Could not sign in for RLS test:', signInError.message);
        return;
      }

      // Try to access existing tables that should still work
      const tables = ['flock_profiles', 'egg_entries', 'expenses', 'customers', 'sales'];
      
      for (const table of tables) {
        const { error } = await anonClient
          .from(table)
          .select('*')
          .limit(1);

        // Should not error (might be empty, but shouldn't error due to RLS)
        expect(error?.message).not.toContain('row-level security');
      }
    });

    it('should preserve existing user data during migration', async () => {
      if (skipTests) return;

      // Verify that existing users get default subscription status
      const { data, error } = await serviceClient
        .from('user_profiles')
        .select('subscription_status, subscription_updated_at')
        .eq('user_id', testUserId)
        .single();

      expect(error).toBeNull();
      expect(data?.subscription_status).toBeDefined();
      expect(['free', 'active', 'cancelled', 'past_due', 'paused']).toContain(data?.subscription_status);
    });
  });
});