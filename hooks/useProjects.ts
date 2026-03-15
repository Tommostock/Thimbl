'use client';

import { useState, useCallback } from 'react';
import { PROJECTS } from '@/lib/data';
import {
  getUserProjects,
  saveUserProject,
  updateUserProject,
  saveShoppingItem,
  generateId,
} from '@/lib/storage';
import type { Project, UserProject } from '@/lib/types/database';

/**
 * useProjects Hook
 *
 * Returns the hardcoded project catalogue. No async fetch needed.
 */
export function useProjects() {
  return { projects: PROJECTS, loading: false, refetch: () => {} };
}

/**
 * useProject Hook
 *
 * Finds a single project by ID from the hardcoded catalogue.
 */
export function useProject(id: string) {
  const project = PROJECTS.find((p) => p.id === id) ?? null;
  return { project, loading: false };
}

/**
 * useUserProjects Hook
 *
 * Reads and writes user project state from localStorage.
 */
export function useUserProjects() {
  const [userProjects, setUserProjects] = useState<(UserProject & { project?: Project })[]>(() => {
    const stored = getUserProjects();
    return stored.map((up) => ({
      ...up,
      project: PROJECTS.find((p) => p.id === up.project_id),
    }));
  });

  const refresh = useCallback(() => {
    const stored = getUserProjects();
    setUserProjects(
      stored.map((up) => ({
        ...up,
        project: PROJECTS.find((p) => p.id === up.project_id),
      }))
    );
  }, []);

  const startProject = (projectId: string): UserProject => {
    const newProject: UserProject = {
      id: generateId(),
      user_id: 'local',
      project_id: projectId,
      status: 'in_progress',
      current_step: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      rating: null,
      review: null,
      hours_logged: 0,
      notes: null,
    };

    saveUserProject(newProject);

    // Auto-populate shopping list from project materials
    const project = PROJECTS.find((p) => p.id === projectId);
    if (project?.materials) {
      (project.materials as Array<{ name: string; quantity?: string }>).forEach((material) => {
        saveShoppingItem({
          id: generateId(),
          user_id: 'local',
          project_id: projectId,
          item_name: material.name,
          quantity: material.quantity || null,
          is_checked: false,
          is_custom: false,
          created_at: new Date().toISOString(),
        });
      });
    }

    refresh();
    return newProject;
  };

  const updateStep = (userProjectId: string, step: number) => {
    updateUserProject(userProjectId, { current_step: step });
    refresh();
  };

  const completeProject = (userProjectId: string, rating: number, review: string) => {
    updateUserProject(userProjectId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      rating,
      review,
    });
    refresh();
  };

  const logHours = (userProjectId: string, hours: number) => {
    const existing = userProjects.find((up) => up.id === userProjectId);
    const currentHours = existing?.hours_logged ?? 0;
    updateUserProject(userProjectId, { hours_logged: currentHours + hours });
    refresh();
  };

  const updateNotes = (userProjectId: string, notes: string) => {
    updateUserProject(userProjectId, { notes });
    refresh();
  };

  return {
    userProjects,
    loading: false,
    startProject,
    updateStep,
    completeProject,
    logHours,
    updateNotes,
    refetch: refresh,
  };
}
