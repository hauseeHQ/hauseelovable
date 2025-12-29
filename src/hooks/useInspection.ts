import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { initializeInspectionData } from '../data/inspectionChecklist';

interface InspectionData {
  id: string;
  home_id: string;
  user_id: string;
  categories: any;
  overall_progress: {
    completed: number;
    total: number;
    percentage: number;
    goodCount: number;
    fixCount: number;
    replaceCount: number;
  };
  created_at: string;
  updated_at: string;
}

export function useInspection(homeId: string | null) {
  const [inspection, setInspection] = useState<InspectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (homeId) {
      loadInspection(homeId);
    } else {
      setInspection(null);
      setLoading(false);
    }
  }, [homeId]);

  const loadInspection = async (homeId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: existingInspection, error: fetchError } = await supabase
        .from('home_inspections')
        .select('*')
        .eq('home_id', homeId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingInspection) {
        setInspection(existingInspection);
      } else {
        const initialCategories = initializeInspectionData();
        const totalItems = Object.values(initialCategories).reduce(
          (sum: number, cat: any) => sum + cat.items.length,
          0
        );

        const newInspection = {
          home_id: homeId,
          user_id: user.id,
          categories: initialCategories,
          overall_progress: {
            completed: 0,
            total: totalItems,
            percentage: 0,
            goodCount: 0,
            fixCount: 0,
            replaceCount: 0,
          },
        };

        const { data: created, error: createError } = await supabase
          .from('home_inspections')
          .insert(newInspection)
          .select()
          .single();

        if (createError) throw createError;
        setInspection(created);
      }
    } catch (err: any) {
      console.error('Error loading inspection:', err);
      setError(err.message || 'Failed to load inspection');
    } finally {
      setLoading(false);
    }
  };

  const updateRating = useCallback(
    async (categoryId: string, itemId: string, rating: 'good' | 'fix' | 'replace') => {
      if (!inspection) return;

      try {
        setSaving(true);

        const updatedCategories = { ...inspection.categories };
        const category = { ...updatedCategories[categoryId] };
        const items = category.items.map((item: any) => {
          if (item.id === itemId) {
            return {
              ...item,
              evaluation: rating,
              evaluatedAt: new Date().toISOString(),
            };
          }
          return item;
        });

        const completedCount = items.filter((i: any) => i.evaluation !== null).length;
        const goodCount = items.filter((i: any) => i.evaluation === 'good').length;
        const fixCount = items.filter((i: any) => i.evaluation === 'fix').length;
        const replaceCount = items.filter((i: any) => i.evaluation === 'replace').length;

        category.items = items;
        category.completedCount = completedCount;
        category.goodCount = goodCount;
        category.fixCount = fixCount;
        category.replaceCount = replaceCount;

        updatedCategories[categoryId] = category;

        const totalCompleted = Object.values(updatedCategories).reduce(
          (sum, cat: any) => sum + cat.completedCount,
          0
        );
        const totalGood = Object.values(updatedCategories).reduce(
          (sum, cat: any) => sum + cat.goodCount,
          0
        );
        const totalFix = Object.values(updatedCategories).reduce(
          (sum, cat: any) => sum + cat.fixCount,
          0
        );
        const totalReplace = Object.values(updatedCategories).reduce(
          (sum, cat: any) => sum + cat.replaceCount,
          0
        );

        const updatedProgress = {
          ...inspection.overall_progress,
          completed: totalCompleted,
          percentage: Math.round((totalCompleted / inspection.overall_progress.total) * 100),
          goodCount: totalGood,
          fixCount: totalFix,
          replaceCount: totalReplace,
        };

        const { error: updateError } = await supabase
          .from('home_inspections')
          .update({
            categories: updatedCategories,
            overall_progress: updatedProgress,
            updated_at: new Date().toISOString(),
          })
          .eq('id', inspection.id);

        if (updateError) throw updateError;

        setInspection({
          ...inspection,
          categories: updatedCategories,
          overall_progress: updatedProgress,
          updated_at: new Date().toISOString(),
        });
      } catch (err: any) {
        console.error('Error updating rating:', err);
        setError(err.message || 'Failed to update rating');
      } finally {
        setSaving(false);
      }
    },
    [inspection]
  );

  const updateNotes = useCallback(
    async (categoryId: string, itemId: string, notes: string) => {
      if (!inspection) return;

      try {
        const updatedCategories = { ...inspection.categories };
        const category = { ...updatedCategories[categoryId] };
        const items = category.items.map((item: any) => {
          if (item.id === itemId) {
            return { ...item, notes };
          }
          return item;
        });

        category.items = items;
        updatedCategories[categoryId] = category;

        const { error: updateError } = await supabase
          .from('home_inspections')
          .update({
            categories: updatedCategories,
            updated_at: new Date().toISOString(),
          })
          .eq('id', inspection.id);

        if (updateError) throw updateError;

        setInspection({
          ...inspection,
          categories: updatedCategories,
          updated_at: new Date().toISOString(),
        });
      } catch (err: any) {
        console.error('Error updating notes:', err);
      }
    },
    [inspection]
  );

  const updateSectionNotes = useCallback(
    async (categoryId: string, notes: string) => {
      if (!inspection) return;

      try {
        const updatedCategories = { ...inspection.categories };
        const category = { ...updatedCategories[categoryId] };
        category.sectionNotes = notes;
        updatedCategories[categoryId] = category;

        const { error: updateError } = await supabase
          .from('home_inspections')
          .update({
            categories: updatedCategories,
            updated_at: new Date().toISOString(),
          })
          .eq('id', inspection.id);

        if (updateError) throw updateError;

        setInspection({
          ...inspection,
          categories: updatedCategories,
          updated_at: new Date().toISOString(),
        });
      } catch (err: any) {
        console.error('Error updating section notes:', err);
      }
    },
    [inspection]
  );

  return {
    inspection,
    loading,
    error,
    saving,
    updateRating,
    updateNotes,
    updateSectionNotes,
    refresh: () => homeId && loadInspection(homeId),
  };
}
