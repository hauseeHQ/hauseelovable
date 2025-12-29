import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as Icons from 'lucide-react';
import { EvaluationCategory, RatingValue, EvaluationPhoto, EvaluationVoiceNote } from '../../types';
import EvaluationItemComponent from './EvaluationItem';
import PhotoUpload from './PhotoUpload';
import VoiceNoteRecorder from './VoiceNoteRecorder';
import {
  loadEvaluationMedia,
  uploadEvaluationPhoto,
  deleteEvaluationPhoto,
  uploadEvaluationVoiceNote,
  deleteEvaluationVoiceNote,
} from '../../lib/supabaseClient';
import { useToast } from '../ToastContainer';

interface EvaluationCategoryCardProps {
  category: EvaluationCategory;
  categoryId: string;
  evaluationId: string | null;
  userId: string;
  isExpanded: boolean;
  onToggle: () => void;
  ratings: Record<string, RatingValue | number | string>;
  itemNotes: Record<string, string>;
  sectionNote: string;
  onRatingChange: (categoryId: string, itemId: string, value: RatingValue | number | string) => void;
  onNoteChange: (itemId: string, note: string) => void;
  onSectionNoteChange: (note: string) => void;
}

export default function EvaluationCategoryCard({
  category,
  categoryId,
  evaluationId,
  userId,
  isExpanded,
  onToggle,
  ratings,
  itemNotes,
  sectionNote,
  onRatingChange,
  onNoteChange,
  onSectionNoteChange,
}: EvaluationCategoryCardProps) {
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[category.icon] || Icons.Home;
  const { showError, showSuccess } = useToast();

  const [photos, setPhotos] = useState<EvaluationPhoto[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<EvaluationVoiceNote[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingVoiceNote, setIsSavingVoiceNote] = useState(false);

  const totalItems = category.items.length;
  const ratedItems = category.items.filter((item) => {
    const value = ratings[item.id];
    return value !== undefined && value !== null && value !== '';
  }).length;
  const progress = totalItems > 0 ? Math.round((ratedItems / totalItems) * 100) : 0;

  useEffect(() => {
    if (isExpanded && evaluationId) {
      loadMedia();
    }
  }, [isExpanded, evaluationId, categoryId]);

  const loadMedia = async () => {
    if (!evaluationId) return;

    const { photos: loadedPhotos, voiceNotes: loadedVoiceNotes, error } = await loadEvaluationMedia(
      evaluationId,
      categoryId
    );

    if (error) {
      console.error('Error loading media:', error);
    } else {
      setPhotos(loadedPhotos || []);
      setVoiceNotes(loadedVoiceNotes || []);
    }
  };

  const handlePhotoUpload = async (files: File[]) => {
    if (!evaluationId) {
      showError('Please save the evaluation first before uploading photos.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const uploadPromises = files.map((file) =>
        uploadEvaluationPhoto(file, evaluationId, categoryId, userId)
      );

      const results = await Promise.all(uploadPromises);
      const failed = results.filter((r) => !r.success);

      if (failed.length > 0) {
        showError(`Failed to upload ${failed.length} photo(s)`);
      } else {
        showSuccess(`Successfully uploaded ${files.length} photo(s)`);
      }

      await loadMedia();
    } catch (error) {
      showError('Error uploading photos');
      console.error(error);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async (photoId: string) => {
    try {
      const { success, error } = await deleteEvaluationPhoto(photoId, userId);

      if (success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        showSuccess('Photo deleted successfully');
      } else {
        showError(error || 'Failed to delete photo');
      }
    } catch (error) {
      showError('Error deleting photo');
      console.error(error);
    }
  };

  const handleVoiceNoteSave = async (audioBlob: Blob, duration: number) => {
    if (!evaluationId) {
      showError('Please save the evaluation first before recording voice notes.');
      return;
    }

    setIsSavingVoiceNote(true);
    try {
      const { success, error } = await uploadEvaluationVoiceNote(
        audioBlob,
        duration,
        evaluationId,
        categoryId,
        userId
      );

      if (success) {
        showSuccess('Voice note saved successfully');
        await loadMedia();
      } else {
        showError(error || 'Failed to save voice note');
      }
    } catch (error) {
      showError('Error saving voice note');
      console.error(error);
    } finally {
      setIsSavingVoiceNote(false);
    }
  };

  const handleVoiceNoteDelete = async (voiceNoteId: string) => {
    try {
      const { success, error } = await deleteEvaluationVoiceNote(voiceNoteId, userId);

      if (success) {
        setVoiceNotes((prev) => prev.filter((vn) => vn.id !== voiceNoteId));
        showSuccess('Voice note deleted successfully');
      } else {
        showError(error || 'Failed to delete voice note');
      }
    } catch (error) {
      showError('Error deleting voice note');
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconComponent className="w-6 h-6 text-primary-400" />
          </div>

          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <div className="font-bold text-gray-900">
                {ratedItems}/{totalItems}
              </div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>

            <div className="w-32 hidden md:block">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 text-center mt-1">{progress}%</div>
            </div>
          </div>
        </div>

        <div className="ml-4">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="px-6 py-4 space-y-1">
            {category.items.map((item) => (
              <EvaluationItemComponent
                key={item.id}
                item={item}
                categoryId={categoryId}
                value={ratings[item.id] || null}
                note={itemNotes[item.id] || ''}
                onRatingChange={onRatingChange}
                onNoteChange={onNoteChange}
              />
            ))}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-6">
            {categoryId !== 'other_observations' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Notes (optional, max 1000 characters)
                </label>
                <textarea
                  value={sectionNote}
                  onChange={(e) => onSectionNoteChange(e.target.value.slice(0, 1000))}
                  placeholder={`Add any general notes about ${category.title.toLowerCase()}...`}
                  maxLength={1000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none"
                  rows={4}
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {sectionNote.length} / 1000
                </div>
              </div>
            )}

            {categoryId !== 'location' && (
              <>
                <div className={categoryId !== 'other_observations' ? 'border-t border-gray-200 pt-6' : ''}>
                  <PhotoUpload
                    photos={photos}
                    maxPhotos={10}
                    onUpload={handlePhotoUpload}
                    onDelete={handlePhotoDelete}
                    isUploading={isUploadingPhoto}
                  />
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <VoiceNoteRecorder
                    voiceNotes={voiceNotes}
                    onSave={handleVoiceNoteSave}
                    onDelete={handleVoiceNoteDelete}
                    isSaving={isSavingVoiceNote}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
