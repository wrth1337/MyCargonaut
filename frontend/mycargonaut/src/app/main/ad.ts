export interface Ad {
    adId: number;
    description: string;
    startLocation: string;
    endLocation: string;
    intermediateGoals: [];
    type: string;
    startDate: Date;
    endDate: Date;
    animals: boolean;
    smoker: boolean;
    notes: string;
    numSeats: number;
    active: boolean;
    userId: number;
}