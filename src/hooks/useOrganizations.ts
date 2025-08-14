import { useEffect, useState } from 'react';
import { useConfig } from '../config/ConfigContext';
import api from '../api/api';
import { useAuth } from 'react-oidc-context';

type Organization = {
  id: string;
  name: string;
};

export const useOrganizations: () => {
  organizations: Organization[];
  allowedCodespaces: any[];
} = () => {
  const auth = useAuth();
  const config = useConfig();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allowedCodespaces, setAllowedCodespaces] = useState<any[]>([]);

  useEffect(() => {
    const fetchAuthorities = async () => {
      const userContextResponse = await api(config, auth).getUserContext();
      const userContext = userContextResponse.data.userContext;
      const allowedCodespaceIds = userContext.allowedCodespaces.map(
        (codespace: any) => codespace.id,
      );

      if (!(allowedCodespaceIds.length > 0)) {
        auth.signoutRedirect();
      } else {
        const response = await api(config).getAuthorities();
        const authorities = response.data.authorities.filter(
          (authority: any) =>
            allowedCodespaceIds.includes('*') ||
            allowedCodespaceIds.includes(authority.id.split(':')[0]),
        );

        if (!(authorities.length > 0)) {
          auth.signoutRedirect();
        } else {
          setAllowedCodespaces(userContext.allowedCodespaces);

          setOrganizations(
            authorities.map(({ id, name }: any) => ({
              id,
              name,
            })),
          );
        }
      }
    };

    fetchAuthorities();
  }, [auth, config]);

  return { organizations, allowedCodespaces };
};
