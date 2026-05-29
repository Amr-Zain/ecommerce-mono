export interface TransformedPermission {
  id: string;
  title: string;
}

export interface RawPermission {
  id: number | bigint;
  resource: string;
  action: string;
}

export class PermissionUtil {
  private static readonly actionAliases: Record<string, string[]> = {
    list: ['index'],
    read: ['show'],
    create: ['store'],
    delete: ['destroy'],
  };
  /**
   * Groups a flat array of permissions by their resource category
   * and formats them with human-readable titles.
   */
  static groupPermissions(permissions: RawPermission[]): Record<string, TransformedPermission[]> {
    const grouped: Record<string, TransformedPermission[]> = {};

    if (Array.isArray(permissions)) {
      permissions.forEach((p) => {
        if (!grouped[p.resource]) {
          grouped[p.resource] = [];
        }

        const title =
          p.action.charAt(0).toUpperCase() +
          p.action.slice(1) +
          ' ' +
          p.resource.charAt(0).toUpperCase() +
          p.resource.slice(1);

        grouped[p.resource].push({
          id: p.id.toString(),
          title,
        });
      });
    }

    return grouped;
  }

  /**
   * Groups a flat array of permissions by their resource category
   * returning an array of string actions for each resource.
   */
  static groupPermissionsAsStrings(permissions: RawPermission[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};

    if (Array.isArray(permissions)) {
      permissions.forEach((p) => {
        if (!grouped[p.resource]) {
          grouped[p.resource] = [];
        }

        const actions = [p.action, ...(this.actionAliases[p.action] || [])];

        for (const action of actions) {
          if (!grouped[p.resource].includes(action)) {
            grouped[p.resource].push(action);
          }
        }

        if (p.resource === 'dashboard' && p.action === 'read') {
          grouped['dashboard-home'] = grouped['dashboard-home'] || [];
          if (!grouped['dashboard-home'].includes('index')) {
            grouped['dashboard-home'].push('index');
          }
        }
      });
    }

    return grouped;
  }
}
