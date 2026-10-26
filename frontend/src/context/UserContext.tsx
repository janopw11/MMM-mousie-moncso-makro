import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { usersApi } from '../api/endpoints';
import type { UserDto } from '../types/api';

interface UserContextValue {
  users: UserDto[];
  activeUser: UserDto | null;
  loading: boolean;
  error: string | null;
  selectUser: (userId: number) => void;
  addUser: (username: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  updateActiveUserVeggieGoal: (veggieGoalG: number) => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const STORAGE_KEY = 'mmm-active-user-id';

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [activeUserId, setActiveUserId] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await usersApi.list();
      setUsers(list);
      setActiveUserId((current) => {
        if (current && list.some((u) => u.id === current)) {
          return current;
        }
        return list.length > 0 ? list[0].id : null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  useEffect(() => {
    if (activeUserId !== null) {
      localStorage.setItem(STORAGE_KEY, String(activeUserId));
    }
  }, [activeUserId]);

  const selectUser = useCallback((userId: number) => {
    setActiveUserId(userId);
  }, []);

  const addUser = useCallback(async (username: string) => {
    const created = await usersApi.create(username);
    setUsers((prev) => [...prev, created]);
    setActiveUserId(created.id);
  }, []);

  const updateActiveUserVeggieGoal = useCallback(
    async (veggieGoalG: number) => {
      if (activeUserId === null) return;
      const updated = await usersApi.updateVeggieGoal(activeUserId, veggieGoalG);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    },
    [activeUserId],
  );

  const activeUser = useMemo(
    () => users.find((u) => u.id === activeUserId) ?? null,
    [users, activeUserId],
  );

  const value = useMemo<UserContextValue>(
    () => ({
      users,
      activeUser,
      loading,
      error,
      selectUser,
      addUser,
      refreshUsers,
      updateActiveUserVeggieGoal,
    }),
    [users, activeUser, loading, error, selectUser, addUser, refreshUsers, updateActiveUserVeggieGoal],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUsers(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return ctx;
}
