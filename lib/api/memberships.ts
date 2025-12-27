import { supabase, getCurrentUser } from '../supabase';
import type { MembershipPlan, Membership, CountryCode, Locale, MembershipStatus } from '@/types';
import { addDays } from 'date-fns';

// Demo membership plans
const DEMO_MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'plan-basic',
    slug: 'basic',
    name_en: 'Basic',
    name_ar: 'الأساسي',
    description_en: 'Perfect for occasional car care',
    description_ar: 'مثالي للعناية بالسيارة من حين لآخر',
    duration_days: 30,
    wash_credits: 2,
    price_eg: 299,
    price_ae: 99,
    is_popular: false,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-standard',
    slug: 'standard',
    name_en: 'Standard',
    name_ar: 'القياسي',
    description_en: 'Best value for regular washing',
    description_ar: 'أفضل قيمة للغسيل المنتظم',
    duration_days: 30,
    wash_credits: 4,
    price_eg: 549,
    price_ae: 179,
    is_popular: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'plan-premium',
    slug: 'premium',
    name_en: 'Premium',
    name_ar: 'المميز',
    description_en: 'Ultimate car care experience',
    description_ar: 'تجربة العناية بالسيارة المثالية',
    duration_days: 30,
    wash_credits: 8,
    price_eg: 999,
    price_ae: 329,
    is_popular: false,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// In-memory demo membership storage
let demoMembership: Membership | null = null;

// Fetch all available membership plans
export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  const user = await getCurrentUser();

  // Return demo plans if no user or for demo testing
  if (!user) {
    return DEMO_MEMBERSHIP_PLANS.filter(p => p.is_active);
  }

  const { data, error } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('is_active', true)
    .order('wash_credits', { ascending: true });

  if (error) {
    console.error('Error fetching membership plans:', error);
    // Fallback to demo plans
    return DEMO_MEMBERSHIP_PLANS.filter(p => p.is_active);
  }

  return data || DEMO_MEMBERSHIP_PLANS.filter(p => p.is_active);
}

// Get current user's active membership
export async function getCurrentMembership(): Promise<Membership | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // Check for demo membership
  if (demoMembership && demoMembership.user_id === user.id) {
    // Check if expired
    if (new Date(demoMembership.expires_at) < new Date()) {
      demoMembership.status = 'expired';
    }
    return demoMembership;
  }

  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching membership:', error);
  }

  return data || null;
}

// Get membership with plan details
export async function getMembershipWithPlan(): Promise<{
  membership: Membership;
  plan: MembershipPlan;
} | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  // Check demo membership
  if (demoMembership && demoMembership.user_id === user.id) {
    const plan = DEMO_MEMBERSHIP_PLANS.find(p => p.id === demoMembership!.plan_id);
    if (plan) {
      return { membership: demoMembership, plan };
    }
  }

  const { data, error } = await supabase
    .from('memberships')
    .select(`
      *,
      plan:membership_plans(*)
    `)
    .eq('user_id', user.id)
    .in('status', ['active', 'paused'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching membership with plan:', error);
  }

  if (data && data.plan) {
    return {
      membership: data,
      plan: data.plan as MembershipPlan,
    };
  }

  return null;
}

// Subscribe to a membership plan
export async function subscribeToPlan(
  planId: string,
  autoRenew: boolean = true
): Promise<Membership> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  // Get the plan details
  const plans = await getMembershipPlans();
  const plan = plans.find(p => p.id === planId);
  if (!plan) throw new Error('Plan not found');

  const startsAt = new Date().toISOString();
  const expiresAt = addDays(new Date(), plan.duration_days).toISOString();

  // For demo/testing, store in memory
  const newMembership: Membership = {
    id: `membership-${Date.now()}`,
    user_id: user.id,
    plan_id: planId,
    starts_at: startsAt,
    expires_at: expiresAt,
    wash_credits_remaining: plan.wash_credits,
    auto_renew: autoRenew,
    status: 'active',
    created_at: startsAt,
    updated_at: startsAt,
  };

  // Try to insert into database
  const { data, error } = await supabase
    .from('memberships')
    .insert({
      user_id: user.id,
      plan_id: planId,
      starts_at: startsAt,
      expires_at: expiresAt,
      wash_credits_remaining: plan.wash_credits,
      auto_renew: autoRenew,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating membership:', error);
    // Store as demo membership
    demoMembership = newMembership;
    return newMembership;
  }

  return data;
}

// Use a wash credit from membership
export async function useWashCredit(): Promise<Membership> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const membership = await getCurrentMembership();
  if (!membership) throw new Error('No active membership');
  if (membership.status !== 'active') throw new Error('Membership is not active');
  if (membership.wash_credits_remaining <= 0) throw new Error('No wash credits remaining');

  const newCredits = membership.wash_credits_remaining - 1;

  // Handle demo membership
  if (demoMembership && demoMembership.id === membership.id) {
    demoMembership.wash_credits_remaining = newCredits;
    demoMembership.updated_at = new Date().toISOString();
    return demoMembership;
  }

  const { data, error } = await supabase
    .from('memberships')
    .update({
      wash_credits_remaining: newCredits,
      updated_at: new Date().toISOString(),
    })
    .eq('id', membership.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Pause membership
export async function pauseMembership(): Promise<Membership> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const membership = await getCurrentMembership();
  if (!membership) throw new Error('No active membership');
  if (membership.status !== 'active') throw new Error('Membership is not active');

  // Handle demo membership
  if (demoMembership && demoMembership.id === membership.id) {
    demoMembership.status = 'paused' as MembershipStatus;
    demoMembership.updated_at = new Date().toISOString();
    return demoMembership;
  }

  const { data, error } = await supabase
    .from('memberships')
    .update({
      status: 'paused' as MembershipStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', membership.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Resume membership
export async function resumeMembership(): Promise<Membership> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const membership = await getCurrentMembership();
  if (!membership) throw new Error('No membership found');
  if (membership.status !== 'paused') throw new Error('Membership is not paused');

  // Handle demo membership
  if (demoMembership && demoMembership.id === membership.id) {
    demoMembership.status = 'active';
    demoMembership.updated_at = new Date().toISOString();
    return demoMembership;
  }

  const { data, error } = await supabase
    .from('memberships')
    .update({
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', membership.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Cancel membership
export async function cancelMembership(): Promise<Membership> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const membership = await getCurrentMembership();
  if (!membership) throw new Error('No membership found');
  if (membership.status === 'cancelled') throw new Error('Membership already cancelled');

  // Handle demo membership
  if (demoMembership && demoMembership.id === membership.id) {
    demoMembership.status = 'cancelled';
    demoMembership.auto_renew = false;
    demoMembership.updated_at = new Date().toISOString();
    return demoMembership;
  }

  const { data, error } = await supabase
    .from('memberships')
    .update({
      status: 'cancelled',
      auto_renew: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', membership.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Toggle auto-renew
export async function toggleAutoRenew(enable: boolean): Promise<Membership> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const membership = await getCurrentMembership();
  if (!membership) throw new Error('No membership found');

  // Handle demo membership
  if (demoMembership && demoMembership.id === membership.id) {
    demoMembership.auto_renew = enable;
    demoMembership.updated_at = new Date().toISOString();
    return demoMembership;
  }

  const { data, error } = await supabase
    .from('memberships')
    .update({
      auto_renew: enable,
      updated_at: new Date().toISOString(),
    })
    .eq('id', membership.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get membership history
export async function getMembershipHistory(): Promise<Membership[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching membership history:', error);
    return [];
  }

  return data || [];
}

// Helper to get localized plan name
export function getPlanName(plan: MembershipPlan, locale: Locale): string {
  return locale === 'ar' ? plan.name_ar : plan.name_en;
}

// Helper to get localized plan description
export function getPlanDescription(plan: MembershipPlan, locale: Locale): string | null {
  return locale === 'ar' ? plan.description_ar : plan.description_en;
}

// Helper to get plan price by country
export function getPlanPrice(plan: MembershipPlan, country: CountryCode): number {
  return country === 'EG' ? (plan.price_eg || 0) : (plan.price_ae || 0);
}

// Helper to format currency
export function formatMembershipPrice(
  plan: MembershipPlan,
  country: CountryCode,
  locale: Locale
): string {
  const price = getPlanPrice(plan, country);
  const currency = country === 'EG' ? 'EGP' : 'AED';

  if (locale === 'ar') {
    return `${price} ${currency === 'EGP' ? 'ج.م' : 'د.إ'}`;
  }
  return `${currency} ${price}`;
}
