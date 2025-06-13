export interface SystemSpecs {
  os: string;
  cpu: string;
  gpu: string;
  ram: string;
}

export interface User {
  name: string;
  image: string; // ← este nombre lo usa ReviewCard
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
  
  screenshot?: string;
  verified?: boolean;
}
