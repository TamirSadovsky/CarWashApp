export type UserData = {
  CarNum?: string;
  DriverName?: string;
  CostomerName?: string;
  CarType?: string;
  Phone?: string;
};

export type WorkItem = { id: number; name: string; groupId?: number; carType?: string };
export type LocationItem = { id: number; name: string; positions?: number };

export type Mode = 'input' | 'choose' | 'found' | 'register' | 'done';
export type Step = 1 | 2 | 3 | 4;
