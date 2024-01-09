import { useAuth } from '@entur/auth-provider';
import { useEffect, useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import api from '../api/api';

type Organization = {
  id: string;
  name: string;
};

export const useOrganizations: () => Organization[] = () => {
  const auth = useAuth();
  const config = useConfig();
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    if (!(auth.roleAssignments?.length > 0)) {
      auth.logout();
    }

    const allowedCodespaces = auth.roleAssignments
      ?.map(JSON.parse)
      .filter(({ r: role }: { r: string }) => role === 'editSX')
      .map(({ o: org }: { o: string }) => org);

    if (!(allowedCodespaces.length > 0)) {
      auth.logout();
    }

    const fetchAuthorities = async () => {
      const response = await api(config).getAuthorities();
      const authorities = response.data.authorities.filter((authority: any) =>
        allowedCodespaces.includes(authority.id.split(':')[0]),
      );

      if (!(authorities.length > 0)) {
        auth.logout();
      }

      setOrganizations(
        authorities.map(({ id, name }: any) => ({
          id,
          name,
        })),
      );
    };

    fetchAuthorities();
  }, [auth, config]);

  return organizations;
};
