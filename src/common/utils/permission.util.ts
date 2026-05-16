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
}
