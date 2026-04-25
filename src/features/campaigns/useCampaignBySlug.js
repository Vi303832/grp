import { useQuery } from '@tanstack/react-query';
import { getCampaignBySlug } from '../../lib/api/campaigns';

export function useCampaignBySlug(slug) {
  return useQuery({
    queryKey: ['campaign', 'slug', slug],
    queryFn: () => getCampaignBySlug(slug),
    enabled: !!slug,
  });
}
