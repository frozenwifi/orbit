"use client";

import { useEffect, useMemo, useState } from "react";
import { OrbitFooter } from "@/components/dashboard/OrbitFooter";
import { useDomain } from "@/components/providers/DomainProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { RemoveTeamUserModal } from "@/components/team/RemoveTeamUserModal";
import { TeamUserModal } from "@/components/team/TeamUserModal";
import { TeamUsersTable } from "@/components/team/TeamUsersTable";
import { Button } from "@/components/ui/Button";
import type { NewTeamUserInput, TeamUser, TeamUserRole } from "@/types/domain";

const PAGE_SIZE = 9;
type UserFormMode = "create" | "edit" | null;

export function TeamUsersManagement() {
  const { teamUsers, createTeamUser, updateTeamUser, updateTeamUserRole, requestTeamUserPasswordRecovery, removeTeamUser } = useDomain();
  const { query, setQuery } = useSearch();
  const { theme } = useTheme();
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<UserFormMode>(null);
  const [activeUser, setActiveUser] = useState<TeamUser | null>(null);
  const [removeUser, setRemoveUser] = useState<TeamUser | null>(null);
  const [recoveryStatus, setRecoveryStatus] = useState("");

  useEffect(() => setPage(1), [query]);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return needle ? teamUsers.filter((user) => `${user.name} ${user.email} ${user.role}`.toLocaleLowerCase().includes(needle)) : teamUsers;
  }, [query, teamUsers]);
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasDialog = Boolean(formMode || removeUser);

  const openCreate = () => { setActiveUser(null); setFormMode("create"); };
  const openEdit = (user: TeamUser) => { setActiveUser(user); setFormMode("edit"); };
  const closeForm = () => { setFormMode(null); setActiveUser(null); };
  const saveUser = (input: NewTeamUserInput) => {
    if (formMode === "edit" && activeUser) updateTeamUser(activeUser.id, input); else createTeamUser(input);
    setQuery("");
    setPage(1);
    closeForm();
  };
  const confirmRemove = () => {
    if (!removeUser) return;
    removeTeamUser(removeUser.id);
    setRemoveUser(null);
  };
  const recoverPassword = (user: TeamUser) => {
    requestTeamUserPasswordRecovery(user.id);
    setRecoveryStatus(`Password recovery requested for ${user.name}.`);
  };

  return <div className={`team-page${hasDialog ? " dialog-state" : ""}`}>
    <header className="team-page-header"><h1>{hasDialog && theme === "light" ? "Users" : "Team"}</h1><Button className="team-add-user" variant="primary" onClick={openCreate}>Add user</Button></header>
    <section className="card team-card" aria-label="Team users">
      <div className="team-toolbar"><label className="team-search"><span className="search-icon" aria-hidden="true" /><span className="sr-only">Search users</span><input type="search" value={query} placeholder="Search" onChange={(event) => setQuery(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === "Enter") setPage(1); }} /></label><Button className="team-search-submit" variant="primary" aria-label="Search users" onClick={() => setPage(1)}><span className="search-icon" aria-hidden="true" /></Button></div>
      <TeamUsersTable users={visibleUsers} page={currentPage} pageCount={pageCount} pageSize={PAGE_SIZE} totalCount={filteredUsers.length} showPasswordColumn={hasDialog} onPageChange={setPage} onRoleChange={(id, role: TeamUserRole) => updateTeamUserRole(id, role)} onRecoverPassword={recoverPassword} onEdit={openEdit} onRemove={setRemoveUser} />
    </section>
    <p className="sr-only" role="status" aria-live="polite">{recoveryStatus}</p>
    <OrbitFooter />
    <TeamUserModal mode={formMode} user={activeUser} onClose={closeForm} onSave={saveUser} />
    <RemoveTeamUserModal user={removeUser} onClose={() => setRemoveUser(null)} onConfirm={confirmRemove} />
  </div>;
}
