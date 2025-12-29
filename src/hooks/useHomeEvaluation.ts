import { useState, useEffect, useCallback } from 'react';
import { HomeEvaluation, RatingValue } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export function useHomeEvaluation(homeId: string) {
  const { user } = useAuth();
  const [evaluation, setEvaluation] = useState<HomeEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvaluation = useCallback(async () => {
    if (!user?.id || !homeId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: loadError } = await supabase
        .from('home_evaluations')
        .select('*')
        .eq('home_id', homeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (loadError) throw loadError;

      if (data) {
        const evalData: HomeEvaluation = {
          id: data.id,
          homeId: data.home_id,
          userId: data.user_id,
          ratings: data.ratings || {},
          itemNotes: data.item_notes || {},
          sectionNotes: data.section_notes || {},
          overallRating: data.overall_rating || 0,
          userOverallRating: data.user_overall_rating,
          completionPercentage: data.completion_percentage || 0,
          evaluationStatus: data.evaluation_status || 'not_started',
          startedAt: data.started_at,
          completedAt: data.completed_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setEvaluation(evalData);
      } else {
        const newEval: Omit<HomeEvaluation, 'id' | 'createdAt' | 'updatedAt'> = {
          homeId,
          userId: user.id,
          ratings: {},
          itemNotes: {},
          sectionNotes: {},
          overallRating: 0,
          userOverallRating: undefined,
          completionPercentage: 0,
          evaluationStatus: 'not_started',
        };
        setEvaluation(newEval as HomeEvaluation);
      }
    } catch (err) {
      console.error('Error loading evaluation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load evaluation');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, homeId]);

  useEffect(() => {
    loadEvaluation();
  }, [loadEvaluation]);

  const saveEvaluation = useCallback(async (updates: Partial<HomeEvaluation>) => {
    if (!user?.id || !homeId) return;

    setIsSaving(true);
    setError(null);

    try {
      const updatedEval = { ...evaluation, ...updates } as HomeEvaluation;

      const now = new Date().toISOString();
      const record = {
        home_id: homeId,
        user_id: user.id,
        workspace_id: user.id,
        ratings: updatedEval.ratings,
        item_notes: updatedEval.itemNotes,
        section_notes: updatedEval.sectionNotes,
        overall_rating: updatedEval.overallRating,
        user_overall_rating: updatedEval.userOverallRating || null,
        completion_percentage: updatedEval.completionPercentage,
        evaluation_status: updatedEval.evaluationStatus,
        started_at: updatedEval.startedAt || now,
        completed_at: updatedEval.completedAt,
        updated_at: now,
      };

      const { data, error: saveError } = await supabase
        .from('home_evaluations')
        .upsert(record, {
          onConflict: 'home_id,user_id',
        })
        .select()
        .single();

      if (saveError) throw saveError;

      if (data) {
        const savedEval: HomeEvaluation = {
          id: data.id,
          homeId: data.home_id,
          userId: data.user_id,
          ratings: data.ratings || {},
          itemNotes: data.item_notes || {},
          sectionNotes: data.section_notes || {},
          overallRating: data.overall_rating || 0,
          userOverallRating: data.user_overall_rating,
          completionPercentage: data.completion_percentage || 0,
          evaluationStatus: data.evaluation_status || 'not_started',
          startedAt: data.started_at,
          completedAt: data.completed_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setEvaluation(savedEval);
      }
    } catch (err) {
      console.error('Error saving evaluation:', err);
      setError(err instanceof Error ? err.message : 'Failed to save evaluation');
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, homeId, evaluation]);

  const updateRating = useCallback(async (categoryId: string, itemId: string, value: RatingValue) => {
    if (!evaluation) return;

    const newRatings = {
      ...evaluation.ratings,
      [categoryId]: {
        ...(evaluation.ratings[categoryId] || {}),
        [itemId]: value,
      },
    };

    const newStatus = evaluation.evaluationStatus === 'not_started' ? 'in_progress' : evaluation.evaluationStatus;

    setEvaluation({
      ...evaluation,
      ratings: newRatings,
      evaluationStatus: newStatus,
    });

    await saveEvaluation({
      ratings: newRatings,
      evaluationStatus: newStatus,
    });
  }, [evaluation, saveEvaluation]);

  const updateItemNote = useCallback(async (itemId: string, note: string) => {
    if (!evaluation) return;

    const newItemNotes = {
      ...evaluation.itemNotes,
      [itemId]: note,
    };

    setEvaluation({
      ...evaluation,
      itemNotes: newItemNotes,
    });

    await saveEvaluation({
      itemNotes: newItemNotes,
    });
  }, [evaluation, saveEvaluation]);

  const updateSectionNote = useCallback(async (sectionId: string, note: string) => {
    if (!evaluation) return;

    const newSectionNotes = {
      ...evaluation.sectionNotes,
      [sectionId]: note,
    };

    setEvaluation({
      ...evaluation,
      sectionNotes: newSectionNotes,
    });

    await saveEvaluation({
      sectionNotes: newSectionNotes,
    });
  }, [evaluation, saveEvaluation]);

  const updateOverallRating = useCallback(async (rating: number) => {
    if (!evaluation) return;

    setEvaluation({
      ...evaluation,
      overallRating: rating,
    });

    await saveEvaluation({
      overallRating: rating,
    });
  }, [evaluation, saveEvaluation]);

  const updateOfferIntent = useCallback(async (intent: 'yes' | 'maybe' | 'no') => {
    if (!user?.id || !homeId) return;

    try {
      const { error: updateError } = await supabase
        .from('homes')
        .update({ offer_intent: intent })
        .eq('id', homeId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating offer intent:', err);
      setError(err instanceof Error ? err.message : 'Failed to update offer intent');
    }
  }, [user?.id, homeId]);

  return {
    evaluation,
    isLoading,
    isSaving,
    error,
    updateRating,
    updateItemNote,
    updateSectionNote,
    updateOverallRating,
    updateOfferIntent,
    refresh: loadEvaluation,
  };
}
