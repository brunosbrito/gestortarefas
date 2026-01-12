import { useQuery } from '@tanstack/react-query';
import analyticsService from '@/services/suprimentos/analyticsService';

// ==================== Analytics Hooks ====================

// General analytics overview
export const useAnalytics = () => {
  return useQuery({
    queryKey: ['suprimentos-analytics'],
    queryFn: async () => {
      const response = await analyticsService.get();
      return response.data;
    },
  });
};

// Costs by category
export const useCostsByCategory = () => {
  return useQuery({
    queryKey: ['suprimentos-costs-by-category'],
    queryFn: async () => {
      const response = await analyticsService.getCostsByCategory();
      return response.data;
    },
  });
};

// Cost evolution over time
export const useCostEvolution = () => {
  return useQuery({
    queryKey: ['suprimentos-cost-evolution'],
    queryFn: async () => {
      const response = await analyticsService.getCostEvolution();
      return response.data;
    },
  });
};

// Supplier analysis
export const useSupplierAnalysis = () => {
  return useQuery({
    queryKey: ['suprimentos-supplier-analysis'],
    queryFn: async () => {
      const response = await analyticsService.getSupplierAnalysis();
      return response.data;
    },
  });
};

// Contract performance
export const useContractPerformance = () => {
  return useQuery({
    queryKey: ['suprimentos-contract-performance'],
    queryFn: async () => {
      const response = await analyticsService.getContractPerformance();
      return response.data;
    },
  });
};

// Category trends
export const useCategoryTrends = () => {
  return useQuery({
    queryKey: ['suprimentos-category-trends'],
    queryFn: async () => {
      const response = await analyticsService.getCategoryTrends();
      return response.data;
    },
  });
};

// Summary statistics
export const useSummaryStats = () => {
  return useQuery({
    queryKey: ['suprimentos-summary-stats'],
    queryFn: async () => {
      const response = await analyticsService.getSummaryStats();
      return response.data;
    },
  });
};
