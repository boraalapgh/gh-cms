/**
 * Skillsets Data Accessor
 *
 * Provides access to the skillsets taxonomy with helper functions
 * for querying skillsets and subskills.
 */

import type { Skillset, Subskill, SkillsetsTaxonomy, SkillsetTag } from "@/types";
import taxonomyData from "../../../skillsets-taxonomy.json";

// Type the imported JSON
const taxonomy = taxonomyData as SkillsetsTaxonomy;

/**
 * Get all skillsets
 */
export function getAllSkillsets(): Skillset[] {
  return taxonomy.skillsets;
}

/**
 * Get a skillset by ID
 */
export function getSkillset(id: string): Skillset | undefined {
  return taxonomy.skillsets.find((s) => s.id === id);
}

/**
 * Get a subskill by ID (searches all skillsets)
 */
export function getSubskill(subskillId: string): { skillset: Skillset; subskill: Subskill } | undefined {
  for (const skillset of taxonomy.skillsets) {
    const subskill = skillset.subskills.find((s) => s.id === subskillId);
    if (subskill) {
      return { skillset, subskill };
    }
  }
  return undefined;
}

/**
 * Get all subskills for a skillset
 */
export function getSubskillsForSkillset(skillsetId: string): Subskill[] {
  const skillset = getSkillset(skillsetId);
  return skillset?.subskills ?? [];
}

/**
 * Search skillsets by name
 */
export function searchSkillsets(query: string): Skillset[] {
  const lowerQuery = query.toLowerCase();
  return taxonomy.skillsets.filter(
    (s) =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Search subskills by name (across all skillsets)
 */
export function searchSubskills(query: string): Array<{ skillset: Skillset; subskill: Subskill }> {
  const lowerQuery = query.toLowerCase();
  const results: Array<{ skillset: Skillset; subskill: Subskill }> = [];

  for (const skillset of taxonomy.skillsets) {
    for (const subskill of skillset.subskills) {
      if (
        subskill.name.toLowerCase().includes(lowerQuery) ||
        subskill.description.toLowerCase().includes(lowerQuery)
      ) {
        results.push({ skillset, subskill });
      }
    }
  }

  return results;
}

/**
 * Build a SkillsetTag from a subskill ID (for activities)
 */
export function buildTagFromSubskill(subskillId: string): SkillsetTag | undefined {
  const result = getSubskill(subskillId);
  if (!result) return undefined;

  return {
    skillsetId: result.skillset.id,
    skillsetName: result.skillset.name,
    subskillId: result.subskill.id,
    subskillName: result.subskill.name,
  };
}

/**
 * Build a SkillsetTag from a skillset ID (for lessons/courses)
 */
export function buildTagFromSkillset(skillsetId: string): SkillsetTag | undefined {
  const skillset = getSkillset(skillsetId);
  if (!skillset) return undefined;

  return {
    skillsetId: skillset.id,
    skillsetName: skillset.name,
  };
}

/**
 * Get taxonomy metadata
 */
export function getTaxonomyMetadata() {
  return taxonomy.metadata;
}

/**
 * Get flattened list of all subskills with parent skillset info
 */
export function getAllSubskillsFlat(): Array<{ skillset: Skillset; subskill: Subskill }> {
  const results: Array<{ skillset: Skillset; subskill: Subskill }> = [];

  for (const skillset of taxonomy.skillsets) {
    for (const subskill of skillset.subskills) {
      results.push({ skillset, subskill });
    }
  }

  return results;
}
