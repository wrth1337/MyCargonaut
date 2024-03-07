import { intermediateGoal } from "./intermediateGoal";

export interface Ad {
    adId: number;
    description: string;
    startLocation: string;
    endLocation: string;
    intermediateGoals: intermediateGoal[];
    type: string;
    startDate: Date;
    endDate: Date;
    animals: boolean;
    smoker: boolean;
    notes: string;
    numSeats: number;
    active: boolean;
    userId: number;
    state: string;
}