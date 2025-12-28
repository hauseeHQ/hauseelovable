import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

export interface CreateProfileData {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  homeStage?: string;
  photoUrl?: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  homeStage?: string;
  photoUrl?: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone || '',
      homeStage: data.home_stage || 'dreaming',
      photoUrl: data.photo_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

export async function createUserProfile(profileData: CreateProfileData): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: profileData.userId,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone || null,
        home_stage: profileData.homeStage || 'dreaming',
        photo_url: profileData.photoUrl || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone || '',
      homeStage: data.home_stage || 'dreaming',
      photoUrl: data.photo_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
}

export async function updateUserProfile(
  userId: string,
  updates: UpdateProfileData
): Promise<UserProfile | null> {
  try {
    const updateData: Record<string, any> = {};

    if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
    if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
    if (updates.phone !== undefined) updateData.phone = updates.phone || null;
    if (updates.homeStage !== undefined) updateData.home_stage = updates.homeStage;
    if (updates.photoUrl !== undefined) updateData.photo_url = updates.photoUrl || null;

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone || '',
      homeStage: data.home_stage || 'dreaming',
      photoUrl: data.photo_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
}

export async function createProfileFromAuthMetadata(
  userId: string,
  email: string,
  metadata?: Record<string, any>
): Promise<UserProfile | null> {
  const fullName = metadata?.fullName || '';
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return createUserProfile({
    userId,
    firstName,
    lastName,
    email,
    phone: metadata?.phoneNumber,
    homeStage: metadata?.homeStage || 'dreaming',
  });
}

export async function ensureUserProfile(
  userId: string,
  email: string,
  metadata?: Record<string, any>
): Promise<UserProfile | null> {
  let profile = await getUserProfile(userId);

  if (!profile) {
    profile = await createProfileFromAuthMetadata(userId, email, metadata);
  }

  return profile;
}
