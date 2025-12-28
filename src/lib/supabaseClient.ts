import { createClient } from '@supabase/supabase-js';
import { DreamHome, SelfAssessment, CategoryScore, AssessmentStatus, MortgageChecklist, ChecklistProgress, ChecklistItemState, MovingTodoList, MovingTodoItemState, BudgetPlannerData, DownPaymentTrackerData, Home, AddHomeFormData, HomeEvaluation } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  throw new Error(
    `Missing Supabase environment variables: ${missingVars.join(', ')}\n` +
    `Please create a .env or .env.local file in the root directory with these variables.\n` +
    `Note: If you already have .env.local, restart the dev server with 'npm run dev'.\n` +
    `See .env.example for reference.`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export interface DreamHomeDbRecord {
  id: string;
  user_id: string;
  construction_status: 'new' | 'ready' | null;
  price_min: number;
  price_max: number;
  preferred_cities: string[];
  property_types: string[];
  bedrooms: string | null;
  bathrooms: string | null;
  max_condo_fees: number | null;
  backyard: 'small' | 'large' | 'indifferent' | null;
  parking_priority: string | null;
  outdoor_space_priority: string | null;
  basement_priority: string | null;
  max_commute: string | null;
  school_proximity_importance: string | null;
  walkability_importance: string | null;
  neighborhood_vibe: string | null;
  timeline: string | null;
  notes: string | null;
  is_complete: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function saveDreamHome(
  userId: string,
  data: DreamHome
): Promise<{ success: boolean; error?: string }> {
  try {
    const record = {
      user_id: userId,
      workspace_id: null,
      construction_status: data.constructionStatus,
      price_min: data.priceRange.min,
      price_max: data.priceRange.max,
      preferred_cities: data.preferredCities,
      property_types: data.propertyTypes,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      max_condo_fees: data.maxCondoFees,
      backyard: data.backyard,
      parking_priority: data.parkingPriority,
      outdoor_space_priority: data.outdoorSpacePriority,
      basement_priority: data.basementPriority,
      max_commute: data.maxCommute,
      school_proximity_importance: data.schoolProximityImportance,
      walkability_importance: data.walkabilityImportance,
      neighborhood_vibe: data.neighborhoodVibe,
      timeline: data.timeline,
      notes: data.notes || '',
      is_complete: data.isComplete,
      completed_at: data.completedAt,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('dream_home_preferences')
      .upsert(record, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error saving dream home:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error saving dream home:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function loadDreamHome(
  userId: string
): Promise<{ data: DreamHome | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('dream_home_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading dream home:', error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null };
    }

    const dbRecord = data as DreamHomeDbRecord;

    const dreamHome: DreamHome = {
      constructionStatus: dbRecord.construction_status,
      priceRange: {
        min: dbRecord.price_min,
        max: dbRecord.price_max,
      },
      preferredCities: dbRecord.preferred_cities || [],
      propertyTypes: (dbRecord.property_types || []) as DreamHome['propertyTypes'],
      bedrooms: dbRecord.bedrooms,
      bathrooms: dbRecord.bathrooms,
      maxCondoFees: dbRecord.max_condo_fees,
      backyard: dbRecord.backyard,
      parkingPriority: dbRecord.parking_priority as DreamHome['parkingPriority'],
      outdoorSpacePriority: dbRecord.outdoor_space_priority as DreamHome['outdoorSpacePriority'],
      basementPriority: dbRecord.basement_priority as DreamHome['basementPriority'],
      maxCommute: dbRecord.max_commute as DreamHome['maxCommute'],
      schoolProximityImportance: dbRecord.school_proximity_importance as DreamHome['schoolProximityImportance'],
      walkabilityImportance: dbRecord.walkability_importance as DreamHome['walkabilityImportance'],
      neighborhoodVibe: dbRecord.neighborhood_vibe as DreamHome['neighborhoodVibe'],
      timeline: dbRecord.timeline,
      notes: dbRecord.notes || '',
      isComplete: dbRecord.is_complete || false,
      completedAt: dbRecord.completed_at,
      updatedAt: dbRecord.updated_at,
    };

    return { data: dreamHome };
  } catch (err) {
    console.error('Error loading dream home:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export interface AssessmentDbRecord {
  id: string;
  user_id: string;
  answers: number[];
  completed_at: string | null;
  score: number | null;
  status: AssessmentStatus;
  category_scores: CategoryScore[];
  created_at: string;
  updated_at: string;
}

export async function saveAssessment(
  userId: string,
  data: SelfAssessment
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const record = {
      user_id: userId,
      workspace_id: userId,
      answers: data.answers,
      completed_at: data.completedAt,
      score: data.score,
      status: data.status,
      category_scores: data.categoryScores,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('self_assessment_responses')
      .upsert(record, {
        onConflict: 'user_id,workspace_id',
      });

    if (error) {
      console.error('Error saving assessment:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error saving assessment:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function loadAssessment(
  userId: string
): Promise<{ data: SelfAssessment | null; error?: string }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const { data, error } = await supabase
      .from('self_assessment_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading assessment:', error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null };
    }

    const dbRecord = data as AssessmentDbRecord;

    const assessment: SelfAssessment = {
      answers: dbRecord.answers || [],
      completedAt: dbRecord.completed_at,
      score: dbRecord.score,
      status: dbRecord.status,
      categoryScores: dbRecord.category_scores || [],
      updatedAt: dbRecord.updated_at,
    };

    return { data: assessment };
  } catch (err) {
    console.error('Error loading assessment:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export interface ChecklistDbRecord {
  id: string;
  user_id: string;
  items: Record<string, ChecklistItemState>;
  progress: ChecklistProgress;
  created_at: string;
  updated_at: string;
}

export async function saveMortgageChecklist(
  userId: string,
  data: MortgageChecklist
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const record = {
      user_id: userId,
      workspace_id: userId,
      items: data.items,
      progress: data.progress,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('mortgage_checklist_items')
      .upsert(record, {
        onConflict: 'user_id,workspace_id',
      });

    if (error) {
      console.error('Error saving checklist:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error saving checklist:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function loadMortgageChecklist(
  userId: string
): Promise<{ data: MortgageChecklist | null; error?: string }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const { data, error } = await supabase
      .from('mortgage_checklist_items')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading checklist:', error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null };
    }

    const dbRecord = data as ChecklistDbRecord;

    const checklist: MortgageChecklist = {
      items: dbRecord.items || {},
      progress: dbRecord.progress || { completed: 0, total: 0, percentage: 0 },
      updatedAt: dbRecord.updated_at,
    };

    return { data: checklist };
  } catch (err) {
    console.error('Error loading checklist:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export interface MovingTodoDbRecord {
  id: string;
  user_id: string;
  items: Record<string, MovingTodoItemState>;
  progress: ChecklistProgress;
  created_at: string;
  updated_at: string;
}

export async function saveMovingTodoList(
  userId: string,
  data: MovingTodoList
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const record = {
      user_id: userId,
      workspace_id: userId,
      items: data.items,
      progress: data.progress,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('moving_todo_items')
      .upsert(record, {
        onConflict: 'user_id,workspace_id',
      });

    if (error) {
      console.error('Error saving moving list:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error saving moving list:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function loadMovingTodoList(
  userId: string
): Promise<{ data: MovingTodoList | null; error?: string }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const { data, error } = await supabase
      .from('moving_todo_items')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading moving list:', error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null };
    }

    const dbRecord = data as MovingTodoDbRecord;

    const movingList: MovingTodoList = {
      items: dbRecord.items || {},
      progress: dbRecord.progress || { completed: 0, total: 19, percentage: 0 },
      updatedAt: dbRecord.updated_at,
    };

    return { data: movingList };
  } catch (err) {
    console.error('Error loading moving list:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export interface BudgetPlannerDbRecord {
  id: string;
  user_id: string;
  current_budget: Record<string, unknown>;
  homeowner_budget: Record<string, unknown>;
  calculations: BudgetPlannerData['calculations'];
  created_at: string;
  updated_at: string;
}

export async function saveBudgetPlanner(
  userId: string,
  data: BudgetPlannerData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const record = {
      user_id: userId,
      workspace_id: userId,
      current_budget: data.budget,
      homeowner_budget: {},
      calculations: data.calculations,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('budget_planner')
      .upsert(record, {
        onConflict: 'user_id,workspace_id',
      });

    if (error) {
      console.error('Error saving budget:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error saving budget:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function loadBudgetPlanner(
  userId: string
): Promise<{ data: BudgetPlannerData | null; error?: string }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const { data, error } = await supabase
      .from('budget_planner')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading budget:', error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null };
    }

    const dbRecord = data as BudgetPlannerDbRecord;

    const budget: BudgetPlannerData = {
      budget: dbRecord.current_budget as BudgetPlannerData['budget'],
      calculations: dbRecord.calculations,
      updatedAt: dbRecord.updated_at,
    };

    return { data: budget };
  } catch (err) {
    console.error('Error loading budget:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export interface DownPaymentTrackerDbRecord {
  id: string;
  user_id: string;
  goal: Record<string, unknown>;
  accounts: Array<Record<string, unknown>>;
  contributions: Array<Record<string, unknown>>;
  calculations: Record<string, unknown>;
  milestones: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export async function saveDownPaymentTracker(
  userId: string,
  data: DownPaymentTrackerData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const record = {
      user_id: userId,
      workspace_id: userId,
      goal: data.goal,
      accounts: data.accounts,
      contributions: data.contributions,
      calculations: data.calculations,
      milestones: data.milestones,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('down_payment_tracker')
      .upsert(record, {
        onConflict: 'user_id,workspace_id',
      });

    if (error) {
      console.error('Error saving down payment tracker:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error saving down payment tracker:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function loadDownPaymentTracker(
  userId: string
): Promise<{ data: DownPaymentTrackerData | null; error?: string }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const { data, error } = await supabase
      .from('down_payment_tracker')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading down payment tracker:', error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null };
    }

    const dbRecord = data as DownPaymentTrackerDbRecord;

    const tracker: DownPaymentTrackerData = {
      goal: dbRecord.goal as DownPaymentTrackerData['goal'],
      accounts: dbRecord.accounts as DownPaymentTrackerData['accounts'],
      contributions: dbRecord.contributions as DownPaymentTrackerData['contributions'],
      calculations: dbRecord.calculations as DownPaymentTrackerData['calculations'],
      milestones: dbRecord.milestones as DownPaymentTrackerData['milestones'],
      updatedAt: dbRecord.updated_at,
    };

    return { data: tracker };
  } catch (err) {
    console.error('Error loading down payment tracker:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function loadHomes(userId: string): Promise<{ data: Home[] | null; error?: string }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const { data, error } = await supabase
      .from('homes')
      .select('*')
      .eq('user_id', userId)
      .eq('workspace_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading homes:', error);
      return { data: null, error: error.message };
    }

    const homes: Home[] = (data || []).map((record: Record<string, unknown>) => ({
      id: record.id as string,
      userId: record.user_id as string,
      workspaceId: record.workspace_id as string,
      address: record.address as string,
      neighborhood: record.neighborhood as string,
      price: Number(record.price),
      bedrooms: Number(record.bedrooms),
      bathrooms: Number(record.bathrooms),
      yearBuilt: record.year_built ? Number(record.year_built) : undefined,
      propertyTaxes: record.property_taxes ? Number(record.property_taxes) : undefined,
      squareFootage: record.square_footage ? Number(record.square_footage) : undefined,
      favorite: record.favorite as boolean,
      compareSelected: record.compare_selected as boolean,
      evaluationStatus: record.evaluation_status as Home['evaluationStatus'],
      offerIntent: record.offer_intent as Home['offerIntent'],
      overallRating: Number(record.overall_rating),
      primaryPhoto: record.primary_photo as string | undefined,
      createdAt: record.created_at as string,
      updatedAt: record.updated_at as string,
    }));

    return { data: homes };
  } catch (err) {
    console.error('Error loading homes:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function addHome(
  userId: string,
  formData: AddHomeFormData
): Promise<{ success: boolean; error?: string; home?: Home }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const record = {
      user_id: userId,
      workspace_id: userId,
      address: formData.address,
      neighborhood: formData.neighborhood,
      price: formData.price,
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      year_built: formData.yearBuilt,
      property_taxes: formData.propertyTaxes,
      square_footage: formData.squareFootage,
      favorite: false,
      compare_selected: false,
      evaluation_status: 'not_started' as const,
      overall_rating: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('homes')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error adding home:', error);
      return { success: false, error: error.message };
    }

    const home: Home = {
      id: data.id,
      userId: data.user_id,
      workspaceId: data.workspace_id,
      address: data.address,
      neighborhood: data.neighborhood,
      price: Number(data.price),
      bedrooms: Number(data.bedrooms),
      bathrooms: Number(data.bathrooms),
      yearBuilt: data.year_built ? Number(data.year_built) : undefined,
      propertyTaxes: data.property_taxes ? Number(data.property_taxes) : undefined,
      squareFootage: data.square_footage ? Number(data.square_footage) : undefined,
      favorite: data.favorite,
      compareSelected: data.compare_selected,
      evaluationStatus: data.evaluation_status,
      offerIntent: data.offer_intent,
      overallRating: Number(data.overall_rating),
      primaryPhoto: data.primary_photo,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { success: true, home };
  } catch (err) {
    console.error('Error adding home:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function updateHome(
  homeId: string,
  updates: Partial<Home>
): Promise<{ success: boolean; error?: string }> {
  try {
    const record: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.address !== undefined) record.address = updates.address;
    if (updates.neighborhood !== undefined) record.neighborhood = updates.neighborhood;
    if (updates.price !== undefined) record.price = updates.price;
    if (updates.bedrooms !== undefined) record.bedrooms = updates.bedrooms;
    if (updates.bathrooms !== undefined) record.bathrooms = updates.bathrooms;
    if (updates.yearBuilt !== undefined) record.year_built = updates.yearBuilt;
    if (updates.propertyTaxes !== undefined) record.property_taxes = updates.propertyTaxes;
    if (updates.squareFootage !== undefined) record.square_footage = updates.squareFootage;
    if (updates.favorite !== undefined) record.favorite = updates.favorite;
    if (updates.compareSelected !== undefined) record.compare_selected = updates.compareSelected;
    if (updates.evaluationStatus !== undefined) record.evaluation_status = updates.evaluationStatus;
    if (updates.offerIntent !== undefined) record.offer_intent = updates.offerIntent;
    if (updates.overallRating !== undefined) record.overall_rating = updates.overallRating;
    if (updates.primaryPhoto !== undefined) record.primary_photo = updates.primaryPhoto;

    const { error } = await supabase
      .from('homes')
      .update(record)
      .eq('id', homeId);

    if (error) {
      console.error('Error updating home:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error updating home:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function deleteHome(homeId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('homes')
      .delete()
      .eq('id', homeId);

    if (error) {
      console.error('Error deleting home:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error deleting home:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function loadEvaluation(
  homeId: string,
  userId: string
): Promise<{ data: HomeEvaluation | null; error?: string }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const { data, error } = await supabase
      .from('home_evaluations')
      .select('*')
      .eq('home_id', homeId)
      .eq('user_id', userId)
      .eq('workspace_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading evaluation:', error);
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null };
    }

    const evaluation: HomeEvaluation = {
      id: data.id,
      homeId: data.home_id,
      userId: data.user_id,
      ratings: data.ratings || {},
      itemNotes: data.item_notes || {},
      sectionNotes: data.section_notes || {},
      overallRating: Number(data.overall_rating),
      completionPercentage: data.completion_percentage,
      evaluationStatus: data.evaluation_status,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { data: evaluation };
  } catch (err) {
    console.error('Error loading evaluation:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function saveEvaluation(
  evaluation: Partial<HomeEvaluation> & { homeId: string; userId: string }
): Promise<{ success: boolean; error?: string; data?: HomeEvaluation }> {
  try {
    // Use user_id as workspace_id (one workspace per user)
    const record = {
      home_id: evaluation.homeId,
      user_id: evaluation.userId,
      workspace_id: evaluation.userId,
      ratings: evaluation.ratings || {},
      item_notes: evaluation.itemNotes || {},
      section_notes: evaluation.sectionNotes || {},
      overall_rating: evaluation.overallRating || 0,
      completion_percentage: evaluation.completionPercentage || 0,
      evaluation_status: evaluation.evaluationStatus || 'not_started',
      started_at: evaluation.startedAt || (evaluation.evaluationStatus === 'in_progress' ? new Date().toISOString() : null),
      completed_at: evaluation.completedAt,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('home_evaluations')
      .upsert(record, {
        onConflict: 'home_id,workspace_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving evaluation:', error);
      return { success: false, error: error.message };
    }

    const savedEvaluation: HomeEvaluation = {
      id: data.id,
      homeId: data.home_id,
      userId: data.user_id,
      ratings: data.ratings,
      itemNotes: data.item_notes,
      sectionNotes: data.section_notes,
      overallRating: Number(data.overall_rating),
      completionPercentage: data.completion_percentage,
      evaluationStatus: data.evaluation_status,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return { success: true, data: savedEvaluation };
  } catch (err) {
    console.error('Error saving evaluation:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function updateEvaluationRating(
  evaluationId: string,
  categoryId: string,
  itemId: string,
  value: string | number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('home_evaluations')
      .select('ratings')
      .eq('id', evaluationId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    const ratings = existing.ratings || {};
    if (!ratings[categoryId]) {
      ratings[categoryId] = {};
    }
    ratings[categoryId][itemId] = value;

    const { error: updateError } = await supabase
      .from('home_evaluations')
      .update({
        ratings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', evaluationId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error updating rating:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
