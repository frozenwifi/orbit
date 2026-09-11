"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Modal } from "@/components/ui/Modal";
import type { NewTeamUserInput, TeamUser, TeamUserPermissions, TeamUserRole } from "@/types/domain";

interface TeamUserModalProps {
  mode: "create" | "edit" | null;
  user: TeamUser | null;
  onClose: () => void;
  onSave: (input: NewTeamUserInput) => void;
}

const emptyPermissions: TeamUserPermissions = { manageEsims: false, manageBilling: false, manageApiKeys: false, manageUsers: false };
const permissionOptions: readonly { key: keyof TeamUserPermissions; label: React.ReactNode }[] = [
  { key: "manageEsims", label: <>View and Manage <strong>eSIMs</strong></> },
  { key: "manageBilling", label: <>View and Manage <strong>Billing</strong></> },
  { key: "manageApiKeys", label: <>View and Manage <strong>API Keys</strong></> },
  { key: "manageUsers", label: <>View and Manage <strong>Users</strong></> },
];
const roleOptions = [{ label: "Admin", value: "Admin" }, { label: "Manager", value: "Manager" }] as const;

export function TeamUserModal({ mode, user, onClose, onSave }: TeamUserModalProps) {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<TeamUserRole>("Admin");
  const [permissions, setPermissions] = useState<TeamUserPermissions>(emptyPermissions);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mode) return;
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPassword(user?.password ?? "");
    setRole(user?.role ?? "Admin");
    setPermissions(user ? { ...user.permissions } : { ...emptyPermissions });
    setError("");
  }, [mode, user]);

  const submit = () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Complete all user fields.");
      return;
    }
    onSave({ name, email, password, role, permissions });
  };

  const copy = mode === "edit" ? "Update this user’s account details and permissions." : "We will send a Welcome Email to new users to set a password and log in to their account.";

  return <Modal open={Boolean(mode)} title={mode === "edit" ? "Edit user" : "New user"} onClose={onClose} showClose={false} portal initialFocus="panel" layerClassName="team-modal-layer" panelClassName="team-user-modal" footer={<div className="team-modal-actions"><Button type="button" onClick={onClose}>Cancel</Button><Button type="button" variant="primary" onClick={submit}>Save</Button></div>}>
    <p className="team-user-copy">{copy}</p>
    <form className="team-user-form" onSubmit={(event) => { event.preventDefault(); submit(); }}>
      <label htmlFor={nameId}>Name<input id={nameId} type="text" value={name} placeholder="Enter user's name" autoComplete="name" onChange={(event) => { setName(event.currentTarget.value); setError(""); }} /></label>
      <label htmlFor={emailId}>Email<input id={emailId} type="email" value={email} placeholder="Enter user's email" autoComplete="email" onChange={(event) => { setEmail(event.currentTarget.value); setError(""); }} /></label>
      <label htmlFor={passwordId}>Password<input id={passwordId} type="password" value={password} placeholder="Enter user's password" autoComplete="new-password" onChange={(event) => { setPassword(event.currentTarget.value); setError(""); }} /></label>
      <div className="team-user-type"><span>User type</span><FilterSelect label="User type" value={role} options={roleOptions} onChange={(value) => setRole(value as TeamUserRole)} /></div>
      <fieldset className="team-permissions"><legend>User permissions</legend>{permissionOptions.map((permission) => <div className="team-permission-row" key={permission.key}><span>{permission.label}</span><button type="button" role="switch" aria-label={typeof permission.label === "string" ? permission.label : permission.key} aria-checked={permissions[permission.key]} className={`team-permission-toggle${permissions[permission.key] ? " active" : ""}`} onClick={() => setPermissions((current) => ({ ...current, [permission.key]: !current[permission.key] }))}><i /></button></div>)}</fieldset>
      {error ? <p className="team-form-error" id={errorId} role="alert">{error}</p> : null}
      <button className="team-hidden-submit" type="submit" tabIndex={-1} aria-hidden="true">Submit</button>
    </form>
  </Modal>;
}
