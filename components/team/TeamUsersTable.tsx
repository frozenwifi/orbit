"use client";

import { EyeIcon } from "@/components/api-keys/ApiKeyIcons";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Pagination } from "@/components/ui/Pagination";
import type { TeamUser, TeamUserRole } from "@/types/domain";

interface TeamUsersTableProps {
  users: readonly TeamUser[];
  page: number;
  pageCount: number;
  pageSize: number;
  totalCount: number;
  showPasswordColumn: boolean;
  onPageChange: (page: number) => void;
  onRoleChange: (id: string, role: TeamUserRole) => void;
  onRecoverPassword: (user: TeamUser) => void;
  onEdit: (user: TeamUser) => void;
  onRemove: (user: TeamUser) => void;
}

const sort = <span className="team-sort" aria-hidden="true">⌃<i>⌄</i></span>;
const roles = [{ label: "Admin", value: "Admin" }, { label: "Manager", value: "Manager" }] as const;

export function TeamUsersTable({ users, page, pageCount, pageSize, totalCount, showPasswordColumn, onPageChange, onRoleChange, onRecoverPassword, onEdit, onRemove }: TeamUsersTableProps) {
  const start = totalCount ? ((page - 1) * pageSize) + 1 : 0;
  const end = Math.min(page * pageSize, totalCount);
  const figmaEnd = page === 1 && totalCount > pageSize ? Math.min(pageSize + 1, totalCount) : end;

  return <>
    <div className="team-table-wrap">
      <table className={`team-table${showPasswordColumn ? " with-password" : ""}`}>
        <thead><tr>
          <th scope="col">Name{sort}</th>
          <th scope="col">Email{sort}</th>
          {showPasswordColumn ? <th scope="col">Password{sort}</th> : null}
          <th scope="col">User type{sort}</th>
          <th scope="col"><span className="sr-only">Actions</span></th>
        </tr></thead>
        <tbody>{users.map((user) => <tr key={user.id}>
          <td data-label="Name">{user.name}</td>
          <td data-label="Email">{user.email}</td>
          {showPasswordColumn ? <td data-label="Password"><span className="team-password"><EyeIcon aria-hidden="true" /><span aria-hidden="true">••••••••••••</span><span className="sr-only">Password hidden</span></span></td> : null}
          <td data-label="User type"><FilterSelect label={`User type for ${user.name}`} value={user.role} options={roles} onChange={(value) => onRoleChange(user.id, value as TeamUserRole)} /></td>
          <td data-label="Actions"><div className="team-row-actions">
            {!showPasswordColumn ? <button className="team-recover-button" type="button" onClick={() => onRecoverPassword(user)}>recover password</button> : null}
            <button className="team-icon-action edit" type="button" aria-label={`Edit ${user.name}`} onClick={() => onEdit(user)} />
            <button className="team-icon-action remove" type="button" aria-label={`Remove ${user.name}`} onClick={() => onRemove(user)} />
          </div></td>
        </tr>)}</tbody>
      </table>
    </div>
    <footer className="team-table-footer"><span>Showing {start} to {figmaEnd} of {totalCount} entries</span><Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} ariaLabel="Team user table pages" /></footer>
  </>;
}
