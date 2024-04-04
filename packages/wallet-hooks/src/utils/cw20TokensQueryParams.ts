export const fetchCW20TokensQueryParams = {
  retry: (failureCount: number, error: any) => {
    if (error.response?.status === 404 || error.response?.status === 403 || error.response?.status === 429) {
      return false;
    }

    return failureCount < 3;
  },
};
