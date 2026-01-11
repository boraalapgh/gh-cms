/**
 * Editor Page
 *
 * Dynamic route for editing entities of any type.
 * Fetches entity data and blocks, passes to EditorLayout.
 */

import { notFound } from "next/navigation";
import { db } from "@/db";
import { entities, blocks, activities } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { EditorLayout } from "@/components/editor";
import { Block as BlockType, ActivityType } from "@/types";

interface EditorPageProps {
  params: Promise<{
    type: string;
    id: string;
  }>;
}

async function getEntity(id: string) {
  const [entity] = await db
    .select()
    .from(entities)
    .where(eq(entities.id, id))
    .limit(1);
  return entity;
}

async function getActivityType(entityId: string): Promise<ActivityType | undefined> {
  const [activity] = await db
    .select()
    .from(activities)
    .where(eq(activities.entityId, entityId))
    .limit(1);
  return activity?.activityType as ActivityType | undefined;
}

async function getBlocks(entityId: string): Promise<BlockType[]> {
  const result = await db
    .select()
    .from(blocks)
    .where(eq(blocks.entityId, entityId))
    .orderBy(asc(blocks.order));

  return result.map((block) => ({
    id: block.id,
    type: block.type,
    content: block.content as Record<string, unknown>,
    settings: block.settings as { style?: React.CSSProperties; className?: string },
    parentId: block.parentId,
    order: block.order,
  }));
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { type, id } = await params;

  // Validate entity type
  const validTypes = ["activity", "lesson", "course", "assessment"];
  if (!validTypes.includes(type)) {
    notFound();
  }

  // Fetch entity
  const entity = await getEntity(id);
  if (!entity || entity.type !== type) {
    notFound();
  }

  // Fetch activity type if entity is an activity
  let activityType: ActivityType | undefined;
  if (type === "activity") {
    activityType = await getActivityType(id);
  }

  // Fetch blocks
  const entityBlocks = await getBlocks(id);

  return (
    <EditorLayout
      entityId={id}
      entityType={type}
      entityTitle={entity.title}
      activityType={activityType}
      initialBlocks={entityBlocks}
    />
  );
}
