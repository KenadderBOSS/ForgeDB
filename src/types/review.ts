export interface SystemSpecs {
  os: string;
  cpu: string;
  gpu: string;
  ram: string;
}

export interface User {
  name: string;
  avatar: string;
  badges: string[];
  reviewCount: number;
}

export interface Review {
  id: string;
  modId: string;
  modName: string;
  userId: string;
  user: User;
  minecraftVersion: string;
  forgeVersion: string;
  systemSpecs: SystemSpecs;
  issueType: 'client' | 'server' | 'both';
  conflictingMods: Array<{
    name: string;
    causesCrash: boolean;
  }>;
  description: string;
  createdAt: string;
  reactions: {
    likes: number;
    dislikes: number;
  };
  userReactions: {
    [userId: string]: 'like' | 'dislike' | null;
  };
  screenshot?: string;
  verified?: boolean;
}
