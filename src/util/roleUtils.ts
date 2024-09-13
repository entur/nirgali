export function hasExtraJourneysAccess(
  auth: any,
  selectedOrganization: string,
) {
  const codespace = selectedOrganization.split(':')[0];
  return auth.roleAssignments
    ?.map(JSON.parse)
    .filter(({ r: role }: { r: string }) => role === 'editExtraJourneys')
    .some(({ o: org }: { o: string }) => org === codespace);
}
