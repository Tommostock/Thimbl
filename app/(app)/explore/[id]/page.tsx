'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Share2,
  Clock,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Play,
  Check,
  Plus,
  Trash2,
  MessageSquare,
  Lightbulb,
  Loader2,
} from 'lucide-react';

import { PROJECTS } from '@/lib/data';
import {
  getUserProjects,
  saveUserProject,
  updateUserProject,
  getProjectNotes,
  saveProjectNote,
  deleteProjectNote,
  addRecentlyViewed,
  generateId,
  getStorage,
  setStorage,
} from '@/lib/storage';
import { CATEGORIES, DIFFICULTIES, XP_REWARDS } from '@/lib/constants';
import { awardXP } from '@/lib/xp';
import { shareProject } from '@/lib/sharing';
import { useFavorites } from '@/hooks/useFavorites';
import { useAchievements } from '@/hooks/useAchievements';
import Timer from '@/components/project/Timer';
import CraftMode from '@/components/project/CraftMode';
import StarRating from '@/components/ui/StarRating';
import DifficultyBadge from '@/components/catalogue/DifficultyBadge';
import type { UserProject, ProjectNote, MaterialItem, StepItem } from '@/lib/types/database';

const categoryColours: Record<string, string> = {
  sewing: '#C67B5C',
  knitting: '#8BA888',
  crochet: '#D4A0A0',
  embroidery: '#D4A843',
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { checkAchievements } = useAchievements();

  // Project data
  const project = PROJECTS.find((p) => p.id === id);
  const materials = (project?.materials ?? []) as MaterialItem[];
  const steps = (project?.steps ?? []) as StepItem[];

  // User project state
  const [userProject, setUserProject] = useState<UserProject | null>(null);
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [materialChecks, setMaterialChecks] = useState<boolean[]>([]);

  // UI state
  const [materialsExpanded, setMaterialsExpanded] = useState(true);
  const [showCraftMode, setShowCraftMode] = useState(false);
  const [showLogHours, setShowLogHours] = useState(false);
  const [hoursInput, setHoursInput] = useState('');
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionRating, setCompletionRating] = useState(0);
  const [completionReview, setCompletionReview] = useState('');
  const [heartAnimating, setHeartAnimating] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (!project) return;
    addRecentlyViewed(project.id);

    const userProjects = getUserProjects();
    const existing = userProjects.find((up) => up.project_id === id);
    if (existing) setUserProject(existing);

    setNotes(getProjectNotes(id));
    setMaterialChecks(new Array(materials.length).fill(false));
  }, [id, project, materials.length]);

  // Handlers
  const handleStartProject = useCallback(() => {
    if (!project) return;
    const newUserProject: UserProject = {
      id: generateId(),
      user_id: 'local',
      project_id: project.id,
      status: 'in_progress',
      current_step: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      rating: null,
      review: null,
      hours_logged: 0,
      notes: null,
    };
    saveUserProject(newUserProject);
    setUserProject(newUserProject);
    awardXP(XP_REWARDS.START_PROJECT);
    checkAchievements();
  }, [project, checkAchievements]);

  const handleToggleStep = useCallback(
    (stepOrder: number) => {
      if (!userProject) return;
      // Steps are 1-indexed; current_step tracks how many are done
      const newStep = stepOrder > userProject.current_step ? stepOrder : stepOrder - 1;
      updateUserProject(userProject.id, { current_step: newStep });
      setUserProject((prev) => (prev ? { ...prev, current_step: newStep } : prev));

      // Award XP when marking a step complete (not when unmarking)
      if (stepOrder > userProject.current_step) {
        awardXP(XP_REWARDS.COMPLETE_STEP);
        checkAchievements();
      }
    },
    [userProject, checkAchievements],
  );

  const handleLogHours = useCallback(() => {
    if (!userProject || !hoursInput) return;
    const hours = parseFloat(hoursInput);
    if (isNaN(hours) || hours <= 0) return;
    const newTotal = (userProject.hours_logged || 0) + hours;
    updateUserProject(userProject.id, { hours_logged: newTotal });
    setUserProject((prev) => (prev ? { ...prev, hours_logged: newTotal } : prev));
    awardXP(Math.floor(hours) * XP_REWARDS.LOG_TIME_PER_HOUR);
    setHoursInput('');
    setShowLogHours(false);
    checkAchievements();
  }, [userProject, hoursInput, checkAchievements]);

  const handleAddNote = useCallback(() => {
    if (!noteText.trim()) return;
    const note: ProjectNote = {
      id: generateId(),
      projectId: id,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    saveProjectNote(note);
    setNotes((prev) => [note, ...prev]);
    setNoteText('');
    setShowNoteInput(false);
  }, [id, noteText]);

  const handleDeleteNote = useCallback((noteId: string) => {
    deleteProjectNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const handleShare = useCallback(async () => {
    if (!project) return;
    await shareProject(project);
    // Increment share count for achievements
    const storage = getStorage();
    setStorage({
      userStats: {
        ...storage.userStats,
        projects_shared: (storage.userStats.projects_shared ?? 0) + 1,
      },
    });
    awardXP(XP_REWARDS.SHARE_PROJECT);
    checkAchievements();
  }, [project, checkAchievements]);

  const handleToggleFavorite = useCallback(() => {
    if (!project) return;
    setHeartAnimating(true);
    toggleFavorite(project.id);
    if (!isFavorite(project.id)) {
      awardXP(XP_REWARDS.ADD_FAVORITE);
    }
    setTimeout(() => setHeartAnimating(false), 400);
  }, [project, toggleFavorite, isFavorite]);

  const handleCompleteProject = useCallback(() => {
    if (!userProject) return;
    updateUserProject(userProject.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      rating: completionRating || null,
      review: completionReview || null,
    });
    setUserProject((prev) =>
      prev
        ? {
            ...prev,
            status: 'completed',
            completed_at: new Date().toISOString(),
            rating: completionRating || null,
            review: completionReview || null,
          }
        : prev,
    );
    awardXP(XP_REWARDS.COMPLETE_PROJECT);
    if (completionRating > 0) awardXP(XP_REWARDS.RATE_PROJECT);
    checkAchievements();
    setShowCompletion(false);
  }, [userProject, completionRating, completionReview, checkAchievements]);

  const handleCraftModeComplete = useCallback(() => {
    setShowCraftMode(false);
    // Increment craft mode session count
    const storage = getStorage();
    setStorage({
      userStats: {
        ...storage.userStats,
        craft_mode_sessions: (storage.userStats.craft_mode_sessions ?? 0) + 1,
      },
    });
    awardXP(XP_REWARDS.COMPLETE_CRAFT_MODE);
    checkAchievements();
  }, [checkAchievements]);

  // Not found
  if (!project) {
    return (
      <div className="px-4 pt-12 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>Project not found.</p>
      </div>
    );
  }

  const bgColour = categoryColours[project.category] ?? '#C67B5C';
  const category = CATEGORIES.find((c) => c.key === project.category);
  const categoryLabel = category?.label ?? project.category;
  const categoryEmoji = category?.emoji ?? '🧵';
  const allStepsDone = userProject ? userProject.current_step >= steps.length : false;
  const isCompleted = userProject?.status === 'completed';

  return (
    <div className="px-4 pt-0 pb-32">
      {/* Hero area */}
      <div
        className="relative -mx-4 h-48 flex items-center justify-center"
        style={{ backgroundColor: `${bgColour}20` }}
      >
        <span className="text-6xl">{categoryEmoji}</span>

        {/* Action bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/search')}
            className="w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
            style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            aria-label="Back to search"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
              style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              aria-label="Share project"
            >
              <Share2 size={18} />
            </button>
            <motion.button
              onClick={handleToggleFavorite}
              className="w-10 h-10 rounded-full flex items-center justify-center min-h-[44px] min-w-[44px]"
              style={{ backgroundColor: 'var(--bg-primary)' }}
              animate={heartAnimating ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
              aria-label={isFavorite(id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                size={18}
                fill={isFavorite(id) ? '#e74c3c' : 'none'}
                stroke={isFavorite(id) ? '#e74c3c' : 'var(--text-primary)'}
              />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Title section */}
      <div className="mt-4 mb-4">
        <span
          className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-2"
          style={{ backgroundColor: bgColour, color: '#fff' }}
        >
          {categoryLabel}
        </span>
        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          {project.title}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {project.description}
        </p>
      </div>

      {/* Info bar */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div
          className="flex flex-col items-center gap-1 p-3 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <Clock size={18} style={{ color: 'var(--accent-primary)' }} />
          <span className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            {project.estimated_time || 'N/A'}
          </span>
        </div>
        <div
          className="flex flex-col items-center gap-1 p-3 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <DifficultyBadge difficulty={project.difficulty} />
        </div>
        <div
          className="flex flex-col items-center gap-1 p-3 rounded-xl"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <ShoppingBag size={18} style={{ color: 'var(--accent-tertiary)' }} />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {materials.length} items
          </span>
        </div>
      </div>

      {/* Progress section */}
      {userProject && !isCompleted && (
        <div className="mb-5 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Progress
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {userProject.current_step} / {steps.length} steps
            </span>
          </div>
          <div
            className="w-full h-2.5 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--border-colour)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--accent-primary)' }}
              initial={{ width: 0 }}
              animate={{
                width: `${steps.length > 0 ? (userProject.current_step / steps.length) * 100 : 0}%`,
              }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Completed badge */}
      {isCompleted && (
        <div
          className="mb-5 p-4 rounded-xl flex items-center gap-3"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
        >
          <Check size={24} />
          <div>
            <p className="font-bold text-sm">Project Completed!</p>
            {userProject?.rating && (
              <div className="mt-1">
                <StarRating rating={userProject.rating} readonly size={16} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Materials list */}
      {materials.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setMaterialsExpanded(!materialsExpanded)}
            className="w-full flex items-center justify-between py-3 min-h-[44px]"
          >
            <h2
              className="text-lg font-bold flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              <ShoppingBag size={18} style={{ color: 'var(--accent-primary)' }} />
              Materials ({materials.length})
            </h2>
            {materialsExpanded ? (
              <ChevronUp size={20} style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />
            )}
          </button>
          <AnimatePresence initial={false}>
            {materialsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ul className="space-y-1">
                  {materials.map((material, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 py-2 text-sm"
                      style={{ borderBottom: '1px solid var(--border-colour)' }}
                    >
                      <button
                        onClick={() =>
                          setMaterialChecks((prev) => {
                            const next = [...prev];
                            next[i] = !next[i];
                            return next;
                          })
                        }
                        className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 min-h-[20px] min-w-[20px]"
                        style={{
                          borderColor: materialChecks[i]
                            ? 'var(--accent-primary)'
                            : 'var(--border-colour)',
                          backgroundColor: materialChecks[i]
                            ? 'var(--accent-primary)'
                            : 'transparent',
                        }}
                        aria-label={`Toggle ${material.name}`}
                      >
                        {materialChecks[i] && <Check size={12} color="#fff" />}
                      </button>
                      <span
                        style={{
                          color: materialChecks[i]
                            ? 'var(--text-muted)'
                            : 'var(--text-primary)',
                          textDecoration: materialChecks[i] ? 'line-through' : 'none',
                        }}
                      >
                        {material.name}
                      </span>
                      {material.quantity && (
                        <span className="ml-auto shrink-0" style={{ color: 'var(--text-muted)' }}>
                          {material.quantity}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Steps list */}
      {steps.length > 0 && (
        <div className="mb-5">
          <h2
            className="text-lg font-bold mb-3 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            <Check size={18} style={{ color: 'var(--accent-secondary)' }} />
            Steps ({steps.length})
          </h2>
          <ol className="space-y-4">
            {steps.map((step) => {
              const isStepDone = userProject ? step.order <= userProject.current_step : false;
              return (
                <li key={step.order} className="flex gap-3">
                  <button
                    onClick={() => userProject && handleToggleStep(step.order)}
                    disabled={!userProject}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors min-h-[32px] min-w-[32px]"
                    style={{
                      backgroundColor: isStepDone ? 'var(--accent-primary)' : 'transparent',
                      border: isStepDone ? 'none' : '2px solid var(--border-colour)',
                      color: isStepDone ? '#fff' : 'var(--text-muted)',
                      cursor: userProject ? 'pointer' : 'default',
                    }}
                    aria-label={`Step ${step.order}: ${isStepDone ? 'completed' : 'pending'}`}
                  >
                    {isStepDone ? <Check size={14} /> : step.order}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed mt-0.5"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {step.description}
                    </p>
                    {step.tip && (
                      <div
                        className="mt-2 p-2.5 rounded-lg text-xs flex gap-2"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <Lightbulb
                          size={14}
                          className="shrink-0 mt-0.5"
                          style={{ color: 'var(--accent-primary)' }}
                        />
                        <span className="italic">{step.tip}</span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Tips section */}
      {project.tips && (
        <div
          className="rounded-xl p-4 mb-5"
          style={{
            background: `color-mix(in srgb, var(--accent-primary) 10%, transparent)`,
          }}
        >
          <h2
            className="text-base font-bold mb-2 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            <Lightbulb size={18} style={{ color: 'var(--accent-primary)' }} />
            Tips & Tricks
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {project.tips}
          </p>
        </div>
      )}

      {/* Personal notes section */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-lg font-bold flex items-center gap-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            <MessageSquare size={18} style={{ color: 'var(--accent-secondary)' }} />
            Notes
          </h2>
          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="flex items-center gap-1 text-sm font-medium min-h-[44px] px-2"
            style={{ color: 'var(--accent-primary)' }}
          >
            <Plus size={16} />
            Add Note
          </button>
        </div>

        <AnimatePresence>
          {showNoteInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a note..."
                className="w-full p-3 rounded-xl text-sm resize-none border-none outline-none"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  minHeight: 80,
                }}
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 min-h-[36px]"
                  style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {notes.length === 0 && !showNoteInput && (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No notes yet.
          </p>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-3 rounded-xl mb-2 flex items-start justify-between gap-2"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {note.text}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDeleteNote(note.id)}
              className="shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Delete note"
            >
              <Trash2 size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        ))}
      </div>

      {/* Timer widget */}
      <div className="mb-5">
        <Timer />
      </div>

      {/* Complete project section */}
      {userProject && !isCompleted && allStepsDone && (
        <div className="mb-5">
          {!showCompletion ? (
            <button
              onClick={() => setShowCompletion(true)}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
            >
              <Check size={18} />
              Complete Project
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <h3
                className="font-bold text-base mb-3"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                Rate your project
              </h3>
              <div className="mb-3">
                <StarRating rating={completionRating} onRate={setCompletionRating} size={28} />
              </div>
              <textarea
                value={completionReview}
                onChange={(e) => setCompletionReview(e.target.value)}
                placeholder="How did it go? (optional)"
                className="w-full p-3 rounded-xl text-sm resize-none border-none outline-none mb-3"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  minHeight: 60,
                }}
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCompletion(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium min-h-[44px]"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteProject}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold min-h-[44px]"
                  style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Action buttons (sticky bottom) */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 z-30"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-colour)',
        }}
      >
        <div className="flex gap-2 max-w-lg mx-auto">
          {!userProject ? (
            <button
              onClick={handleStartProject}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <Play size={18} />
              Start Project
            </button>
          ) : (
            <>
              {!isCompleted && (
                <button
                  onClick={() => setShowLogHours(!showLogHours)}
                  className="flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 min-h-[44px]"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-colour)',
                  }}
                >
                  <Clock size={16} />
                  Log Hours
                </button>
              )}
              <button
                onClick={() => setShowCraftMode(true)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 min-h-[44px]"
                style={{ backgroundColor: 'var(--accent-secondary)', color: '#fff' }}
              >
                <Play size={16} />
                Craft Mode
              </button>
            </>
          )}
          <button
            onClick={handleShare}
            className="py-3 px-4 rounded-xl min-h-[44px] flex items-center justify-center"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-colour)',
            }}
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Log hours inline modal */}
      <AnimatePresence>
        {showLogHours && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowLogHours(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm p-5 rounded-2xl"
              style={{ backgroundColor: 'var(--bg-primary)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="font-bold text-base mb-3"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                Log Hours
              </h3>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                Total logged: {userProject?.hours_logged ?? 0}h
              </p>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={hoursInput}
                onChange={(e) => setHoursInput(e.target.value)}
                placeholder="Hours spent"
                className="w-full p-3 rounded-xl text-sm border-none outline-none mb-3"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogHours(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium min-h-[44px]"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogHours}
                  disabled={!hoursInput}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold min-h-[44px] disabled:opacity-40"
                  style={{ backgroundColor: 'var(--accent-primary)', color: '#fff' }}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Craft Mode overlay */}
      <AnimatePresence>
        {showCraftMode && (
          <CraftMode
            steps={steps}
            projectTitle={project.title}
            onClose={() => setShowCraftMode(false)}
            onComplete={handleCraftModeComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
