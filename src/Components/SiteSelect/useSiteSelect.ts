import { useCallback, useEffect, useState } from 'react';
import { getSites, Site } from '@maxtropy/kingfisher-api';
import { MAX_INT } from 'lib/const';
import { RadioTabOption } from '../RadioTab';

export function useSiteSelect(
  projectId: number,
): [Site | null | undefined, RadioTabOption<string>[], (siteId: string) => void, (newSite: Site) => void, () => void] {
  const [sites, setSites] = useState<Site[]>([]);
  const [currSite, setCurrSite] = useState<Site | null>();

  useEffect(() => {
    getSites({ projectId, size: MAX_INT }).then(resSites => {
      const sortedSites = resSites.content.sort((a, b) => (a.createTime as number) - (b.createTime as number));
      setSites(sortedSites);
      setCurrSite(sortedSites[0] || null);
    });
  }, [projectId]);

  const setSiteId = useCallback(
    (siteId: string) => {
      if (currSite && currSite.id === siteId) return;
      setCurrSite(sites.find(site => site.id === siteId));
    },
    [currSite, sites],
  );

  const siteOptions = sites.filter(site => site.id).map(site => ({ label: site.name || '', value: site.id as string }));

  const siteCreated = useCallback(
    (newSite: Site): void => {
      setSites(sites.concat(newSite));
      setCurrSite(newSite);
    },
    [sites],
  );

  const refresh = () => {
    getSites({ projectId, size: MAX_INT }).then(resSites => {
      const sortedSites = resSites.content.sort((a, b) => (a.createTime as number) - (b.createTime as number));
      setSites(sortedSites);
      const selected = sortedSites.find(site => currSite && site.id === currSite.id) || sortedSites[0] || null;
      setCurrSite(selected);
    });
  };

  return [currSite, siteOptions, setSiteId, siteCreated, refresh];
}
