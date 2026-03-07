export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface InstructionVersion {
  id: string;
  instructionSetId: string;
  versionNumber: number;
  content: string;
  notes: string;
  createdAt: string;
  isProduction: boolean;
}

export interface ThreadRecord {
  id: string;
  title: string;
  content: string;
  platform: string;
  model: string;
  tags: string[];
  linkedInstructionIds: string[];
  createdAt: string;
}

export interface InstructionSet {
  id: string;
  name: string;
  slug: string;
  description: string;
  tags: string[];
  versions: InstructionVersion[];
  linkedThreadIds: string[];
  status: "draft" | "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface PublishedEndpoint {
  slug: string;
  instructionSetId: string;
  versionId: string;
  publishedAt: string;
}
