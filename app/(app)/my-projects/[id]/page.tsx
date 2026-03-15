'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Circle,
  Clock,
  Star,
  Lightbulb,
  Loader2,
  Camera,
  MessageSquare,
  Plus,
  Award,
} from 'lucide-react';
import { useUserProjects } from '@/hooks/useProjects';
import { useXP } from '@/hooks/useXP';
import { useAchievements } from '@/hooks/useAchievements';
import { getPhotosForProject, deletePhoto } from '@/lib/storage';
import PhotoUpload from '@/components/projects/PhotoUpload';
import PhotoGallery from '@/components/projects/PhotoGallery';
import type { StepItem } from '@/lib/types/database';
import type { StoredPhoto } from '@/lib/storage';

/**
 * Active Project Detail Page
 *
 * Shows step-by-step checklist, progress bar, time logging, notes, photos,
 * and XP integration. All data sourced from localStorage.
 */

export default function ActiveProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { userProjects, updateStep, completeProject, logHours, updateNotes } = useUserProjects();
  const { award, awardCustom } = useXP();
  const { checkAchievements } = useAchievements();

  const [photos, setPhotos] = useState<StoredPhoto[]>([]);
  const [hoursInput, setHoursInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [showComplete, setShowComplete] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);

  const userProject = userProjects.find((up) => up.id === id) ?? null;
  const project = userProject?.project ?? null;

  useEffect(() => {
    if (userProject) {
      setNotesInput(userProject.notes || '');
    }
    setPhotos(getPhotosForProject(id));
  }, [id, userProject?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = (project?.steps ?? []) as StepItem[];
  const totalSteps = steps.length;
  const currentStep = userProject?.current_step ?? 0;
  const progress = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  const showCelebrationToast = (message: string) => {
    setCelebration(message);
    setTimeout(() => setCelebration(null), 3000);
  };

  const toggleStep = (stepIndex: number) => {
    if (!userProject) return;
    const newStep = stepIndex + 1 > currentStep ? stepIndex + 1 : stepIndex;
    const isAdvancing = newStep > currentStep;

    updateStep(id, newStep);

    if (isAdvancing) {
      const xp = award('COMPLETE_STEP');
      if (xp) showCelebrationToast('+5 XP — Step complete!');
      checkAchievements();
    }
  };

  const handleLogHours = () => {
    if (!userProject || !hoursInput) return;
    const hours = parseFloat(hoursInput);
    if (isNaN(hours) || hours <= 0) return;

    logHours(id, hours);
    setHoursInput('');

    const xpAmount = Math.round(hours * 5);
    if (xpAmount > 0) {
      awardCustom(xpAmount);
      showCelebrationToast(`+${xpAmount} XP — Time logged!`);
      checkAchievements();
    }
  };

  const handleSaveNotes = () => {
    if (!userProject) return;
    updateNotes(id, notesInput);
  };

  const handlePhotoUploaded = (photoId: string) => {
    setPhotos(getPhotosForProject(id));
    const xp = award('UPLOAD_PHOTO');
    if (xp) showCelebrationToast('+10 XP — Photo added!');
    checkAchievements();
  };

  const handlePhotoDeleted = (photoId: string) => {
    deletePhoto(photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  const handleComplete = () => {
    if (!userProject || rating === 0) return;
    setSaving(true);

    completeProject(id, rating, review);
    award('COMPLETE_PROJECT');
    award('RATE_PROJECT');

    const newAchievements = checkAchievements();
    if (newAchievements.length > 0) {
      showCelebrationToast(`Achievement unlocked: ${newAchievements[0].name}!`);
      setTimeout(() => router.push('/my-projects'), 2000);
    } else {
      router.push('/my-projects');
    }
    setSaving(false);
  };

  if (!userProject || !project) {
    return (
      <div className="px-4 pt-12 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>Project not found.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      {/* XP Celebration Toast */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            className="fixed top-4 left-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg flex items-center gap-2"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            <Award size={16} />
            {celebration}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1
            className="text-xl font-bold truncate"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            {project.title}
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {userProject.status === 'completed' ? 'Completed' : `Step ${currentStep} of ${totalSteps}`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <motion.div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Progress
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
            {progress}%
          </span>
        </div>
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Step checklist */}
      <div className="card p-4 mb-4">
        <h2
          className="text-base font-bold mb-3"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Steps
        </h2>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isChecked = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <button
                key={step.order}
                onClick={() => toggleStep(index)}
                className="w-full flex items-start gap-3 text-left"
                disabled={userProject.status === 'completed'}
              >
                <div className="mt-0.5">
                  {isChecked ? (
                    <motion.div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--accent-secondary)' }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check size={14} className="text-white" />
                    </motion.div>
                  ) : (
                    <Circle
                      size={24}
                      strokeWidth={isCurrent ? 2.5 : 1.5}
                      style={{
                        color: isCurrent ? 'var(--accent-primary)' : 'var(--border-colour)',
                      }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-sm font-medium ${isChecked ? 'line-through' : ''}`}
                    style={{
                      color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}
                  >
                    {step.title}
                  </h3>
                  {isCurrent && step.description && (
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {step.description}
                    </p>
                  )}
                  {isCurrent && step.tip && (
                    <div
                      className="mt-2 p-2 rounded-lg text-xs flex gap-1.5"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <Lightbulb size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{step.tip}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Photos section */}
      <div className="card p-4 mb-4">
        <h2
          className="text-base font-bold mb-3 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          <Camera size={16} style={{ color: 'var(--accent-primary)' }} />
          Photos ({photos.length})
        </h2>

        {photos.length > 0 && (
          <div className="mb-3">
            <PhotoGallery photos={photos} onPhotoDeleted={handlePhotoDeleted} />
          </div>
        )}

        {userProject.status === 'in_progress' && (
          <PhotoUpload
            userProjectId={id}
            onPhotoUploaded={handlePhotoUploaded}
          />
        )}
      </div>

      {/* Time logging */}
      <div className="card p-4 mb-4">
        <h2
          className="text-base font-bold mb-3 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          <Clock size={16} style={{ color: 'var(--accent-primary)' }} />
          Time Logged: {userProject.hours_logged || 0}h
        </h2>
        {userProject.status === 'in_progress' && (
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Hours"
              value={hoursInput}
              onChange={(e) => setHoursInput(e.target.value)}
              step="0.5"
              min="0"
              className="flex-1 px-3 py-2.5 rounded-xl text-sm border outline-none"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-colour)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={handleLogHours}
              className="px-4 py-2.5 rounded-xl text-white text-sm font-medium min-h-[44px]"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="card p-4 mb-4">
        <h2
          className="text-base font-bold mb-3 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          <MessageSquare size={16} style={{ color: 'var(--accent-primary)' }} />
          Notes
        </h2>
        <textarea
          value={notesInput}
          onChange={(e) => setNotesInput(e.target.value)}
          onBlur={handleSaveNotes}
          placeholder="Jot down any thoughts, measurements, or reminders..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none resize-none"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-colour)',
            color: 'var(--text-primary)',
          }}
          readOnly={userProject.status === 'completed'}
        />
      </div>

      {/* Complete project button */}
      {userProject.status === 'in_progress' && currentStep >= totalSteps && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!showComplete ? (
            <button
              onClick={() => setShowComplete(true)}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
              style={{ backgroundColor: 'var(--accent-secondary)' }}
            >
              <Star size={18} />
              Mark as Complete
            </button>
          ) : (
            <div className="card p-5">
              <h3
                className="text-lg font-bold mb-3 text-center"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                Well done! Rate your project
              </h3>

              {/* Star rating */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Star
                      size={28}
                      fill={star <= rating ? 'var(--golden, #D4A843)' : 'none'}
                      style={{
                        color: star <= rating ? 'var(--golden, #D4A843)' : 'var(--border-colour)',
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Review */}
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="How was the project? Any tips for others?"
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl text-sm border outline-none resize-none mb-3"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-colour)',
                  color: 'var(--text-primary)',
                }}
              />

              <button
                onClick={handleComplete}
                disabled={rating === 0 || saving}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : 'Complete Project'}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
