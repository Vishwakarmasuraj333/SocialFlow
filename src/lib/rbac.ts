export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'EDITOR' | 'ANALYST' | 'VIEWER';

export type Permission =
  | 'workspace:delete'
  | 'workspace:update'
  | 'members:manage'
  | 'members:invite'
  | 'accounts:connect'
  | 'accounts:disconnect'
  | 'posts:create'
  | 'posts:edit'
  | 'posts:delete'
  | 'posts:approve'
  | 'posts:publish'
  | 'media:upload'
  | 'media:delete'
  | 'inbox:reply'
  | 'analytics:view'
  | 'reports:export';

const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  OWNER: [
    'workspace:delete',
    'workspace:update',
    'members:manage',
    'members:invite',
    'accounts:connect',
    'accounts:disconnect',
    'posts:create',
    'posts:edit',
    'posts:delete',
    'posts:approve',
    'posts:publish',
    'media:upload',
    'media:delete',
    'inbox:reply',
    'analytics:view',
    'reports:export',
  ],
  ADMIN: [
    'workspace:update',
    'members:manage',
    'members:invite',
    'accounts:connect',
    'accounts:disconnect',
    'posts:create',
    'posts:edit',
    'posts:delete',
    'posts:approve',
    'posts:publish',
    'media:upload',
    'media:delete',
    'inbox:reply',
    'analytics:view',
    'reports:export',
  ],
  MANAGER: [
    'members:invite',
    'accounts:connect',
    'posts:create',
    'posts:edit',
    'posts:delete',
    'posts:approve',
    'posts:publish',
    'media:upload',
    'media:delete',
    'inbox:reply',
    'analytics:view',
    'reports:export',
  ],
  EDITOR: [
    'posts:create',
    'posts:edit',
    'media:upload',
    'inbox:reply',
    'analytics:view',
  ],
  ANALYST: [
    'analytics:view',
    'reports:export',
  ],
  VIEWER: [
    'analytics:view',
  ],
};

export function hasPermission(role: string | undefined, permission: Permission): boolean {
  if (!role) return false;
  const validRole = role.toUpperCase() as WorkspaceRole;
  const permissions = ROLE_PERMISSIONS[validRole];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function canApprovePosts(role: string | undefined): boolean {
  return hasPermission(role, 'posts:approve');
}

export function canPublishDirectly(role: string | undefined): boolean {
  return hasPermission(role, 'posts:publish');
}
