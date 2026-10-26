import { SaaSPlanTier } from "@prisma/client";

export interface PlanFeatureMatrix {
    adminDashboard: boolean;
    midtransGateway: boolean;
    photo360Tour: boolean;
    smartLock: boolean;
    customDomain: boolean;
    exportReports: boolean;
    dedicatedSupport: boolean;
}

export interface SaaSPlanItem {
    id: string;
    tier: SaaSPlanTier;
    name: string;
    description: string | null;
    monthlyPrice: number;
    annualPrice: number;
    maxRooms: number;
    maxProperties: number;
    features: PlanFeatureMatrix;
    isActive: boolean;
    isPopular: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdatePlanInput {
    id: string;
    name: string;
    description: string;
    monthlyPrice: number;
    annualPrice: number;
    maxRooms: number;
    maxProperties: number;
    isPopular: boolean;
    isActive: boolean;
    features: PlanFeatureMatrix;
}

export const PLAN_TIER_CONFIG: Record<
    SaaSPlanTier,
    { maxRooms: number; defaultMonthlyPrice: number }
> = {
    FREE: { maxRooms: 5, defaultMonthlyPrice: 0 },
    STARTER: { maxRooms: 15, defaultMonthlyPrice: 69000 },
    GROWTH: { maxRooms: 40, defaultMonthlyPrice: 179000 },
    PRO: { maxRooms: 100, defaultMonthlyPrice: 349000 },
    ENTERPRISE: { maxRooms: 250, defaultMonthlyPrice: 1000000 },
};

export const DEFAULT_PLAN_SEEDS: Array<{
    tier: SaaSPlanTier;
    name: string;
    description: string;
    monthlyPrice: number;
    annualPrice: number;
    maxRooms: number;
    maxProperties: number;
    isPopular: boolean;
    features: PlanFeatureMatrix;
}> = [
    {
        tier: "FREE",
        name: "Free Forever",
        description: "Cocok untuk pemilik kost rintisan dengan kuota hingga 5 kamar.",
        monthlyPrice: 0,
        annualPrice: 0,
        maxRooms: 5,
        maxProperties: 1,
        isPopular: false,
        features: {
            adminDashboard: true,
            midtransGateway: false,
            photo360Tour: false,
            smartLock: false,
            customDomain: false,
            exportReports: false,
            dedicatedSupport: false,
        },
    },
    {
        tier: "STARTER",
        name: "Starter Sanctuary",
        description: "Solusi hemat untuk pengelolaan kost mikro hingga 15 kamar.",
        monthlyPrice: 69000,
        annualPrice: 690000,
        maxRooms: 15,
        maxProperties: 1,
        isPopular: false,
        features: {
            adminDashboard: true,
            midtransGateway: true,
            photo360Tour: false,
            smartLock: false,
            customDomain: false,
            exportReports: true,
            dedicatedSupport: false,
        },
    },
    {
        tier: "GROWTH",
        name: "Growth Scaler",
        description: "Paling populer untuk bisnis kost berkembang dengan kuota hingga 40 kamar.",
        monthlyPrice: 179000,
        annualPrice: 1790000,
        maxRooms: 40,
        maxProperties: 2,
        isPopular: true,
        features: {
            adminDashboard: true,
            midtransGateway: true,
            photo360Tour: true,
            smartLock: false,
            customDomain: true,
            exportReports: true,
            dedicatedSupport: false,
        },
    },
    {
        tier: "PRO",
        name: "Pro Residence",
        description: "Fitur lengkap otomatisasi penuh untuk kost menengah hingga 100 kamar.",
        monthlyPrice: 349000,
        annualPrice: 3490000,
        maxRooms: 100,
        maxProperties: 5,
        isPopular: false,
        features: {
            adminDashboard: true,
            midtransGateway: true,
            photo360Tour: true,
            smartLock: true,
            customDomain: true,
            exportReports: true,
            dedicatedSupport: true,
        },
    },
    {
        tier: "ENTERPRISE",
        name: "Enterprise Multi-Branch",
        description: "Skala korporasi properti besar di atas 100 kamar dengan dukungan dedikasi.",
        monthlyPrice: 1000000,
        annualPrice: 10000000,
        maxRooms: 250,
        maxProperties: 20,
        isPopular: false,
        features: {
            adminDashboard: true,
            midtransGateway: true,
            photo360Tour: true,
            smartLock: true,
            customDomain: true,
            exportReports: true,
            dedicatedSupport: true,
        },
    },
];
