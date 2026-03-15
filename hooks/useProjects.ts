'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Project, UserProject } from '@/lib/types/database';

/**
 * useProjects Hook
 *
 * Fetches all projects from the catalogue.
 * Also provides methods to start a project, update progress, and complete.
 */

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('category')
        .order('difficulty');

      if (error) throw error;
      setProjects((data as Project[]) ?? []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  return { projects, loading, refetch: fetchProjects };
}

/**
 * useProject Hook
 *
 * Fetches a single project by ID.
 */
export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProject(data as Project);
      } catch (err) {
        console.error('Failed to fetch project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return { project, loading };
}

/**
 * useUserProjects Hook
 *
 * Fetches the current user's started/completed projects.
 */
export function useUserProjects() {
  const [userProjects, setUserProjects] = useState<(UserProject & { project?: Project })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserProjects = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_projects')
        .select('*, project:projects(*)')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;

      // Flatten the join result
      const mapped = (data ?? []).map((row: Record<string, unknown>) => ({
        ...row,
        project: row.project as Project | undefined,
      })) as (UserProject & { project?: Project })[];

      setUserProjects(mapped);
    } catch (err) {
      console.error('Failed to fetch user projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProjects();
  }, [fetchUserProjects]);

  // Start a new project — also populates the shopping list from the project materials
  const startProject = async (projectId: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_projects')
        .insert({
          user_id: user.id,
          project_id: projectId,
          status: 'in_progress',
          current_step: 0,
          hours_logged: 0,
        })
        .select()
        .single();

      if (error) throw error;
      const userProject = data as UserProject;

      // Auto-populate shopping list from project materials
      const { data: project } = await supabase
        .from('projects')
        .select('materials')
        .eq('id', projectId)
        .single();

      if (project?.materials && Array.isArray(project.materials)) {
        const items = (project.materials as Array<{ name: string; quantity?: string }>).map(
          (material) => ({
            user_id: user.id,
            project_id: projectId,
            item_name: material.name,
            quantity: material.quantity || null,
            is_checked: false,
            is_custom: false,
          })
        );

        if (items.length > 0) {
          await supabase.from('shopping_list_items').insert(items);
        }
      }

      await fetchUserProjects();
      return userProject;
    } catch (err) {
      console.error('Failed to start project:', err);
      return null;
    }
  };

  // Update step progress
  const updateStep = async (userProjectId: string, step: number) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_projects')
        .update({ current_step: step })
        .eq('id', userProjectId);

      if (error) throw error;
      await fetchUserProjects();
    } catch (err) {
      console.error('Failed to update step:', err);
    }
  };

  // Complete a project
  const completeProject = async (userProjectId: string, rating: number, review: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_projects')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          rating,
          review,
        })
        .eq('id', userProjectId);

      if (error) throw error;
      await fetchUserProjects();
    } catch (err) {
      console.error('Failed to complete project:', err);
    }
  };

  // Log hours
  const logHours = async (userProjectId: string, hours: number) => {
    try {
      const supabase = createClient();
      // Get current hours first
      const existing = userProjects.find((up) => up.id === userProjectId);
      const currentHours = existing?.hours_logged ?? 0;

      const { error } = await supabase
        .from('user_projects')
        .update({ hours_logged: currentHours + hours })
        .eq('id', userProjectId);

      if (error) throw error;
      await fetchUserProjects();
    } catch (err) {
      console.error('Failed to log hours:', err);
    }
  };

  // Update notes
  const updateNotes = async (userProjectId: string, notes: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_projects')
        .update({ notes })
        .eq('id', userProjectId);

      if (error) throw error;
      await fetchUserProjects();
    } catch (err) {
      console.error('Failed to update notes:', err);
    }
  };

  return {
    userProjects,
    loading,
    startProject,
    updateStep,
    completeProject,
    logHours,
    updateNotes,
    refetch: fetchUserProjects,
  };
}
