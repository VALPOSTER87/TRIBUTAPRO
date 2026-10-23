import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Check, 
  Lock, 
  Key, 
  UserCheck, 
  ShieldAlert,
  Building2,
  Users
} from 'lucide-react';
import { UserProfile, RoleLevel } from '../types/tax';

interface UserRoleSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
}

export const UserRoleSwitcher: React.FC<UserRoleSwitcherProps> = ({
  isOpen,
  onClose,
  currentUser,
  availableUsers,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  const permissionLabels: Record<keyof UserProfile['permissions'], string> = {
    canCalculateRetentions: 'Calcular Retenções & Registar Faturas',
    canEmitGuides: 'Emitir Guias DAR & Gerar Códigos RUPE',
    canApproveGuides: 'Validar Pagamento de Guias junto da AGT',
    canImportExcel: 'Importar Lotes de Planilhas Excel / CSV',
    canExportAccounting: 'Exportar Ficheiros SAF-T e ERPs (Primavera, SAP)',
    canManageUsers: 'Gestão de Utilizadores e Perfis de Acesso',
    canManageTaxRates: 'Configuração de Taxas e Artigos da Lei',
    canDeleteRecords: 'Eliminar Lançamentos e Documentos',
    canViewAuditLog: 'Visualizar Trilhas e Registos de Auditoria',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-3xl my-8 overflow-hidden text-neutral-900 dark:text-neutral-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Controlo de Acesso & Perfis de Segurança (RBAC)
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                Multiusuário com Níveis de Permissão Granular
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Selection Grid */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Selecione o Utilizador Ativo na Sessão:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableUsers.map((user) => {
                const isSelected = currentUser.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      onClose();
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/40 dark:bg-amber-950/30 ring-1 ring-amber-600'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/30 dark:bg-neutral-950/20'
                    }`}
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-300 dark:ring-neutral-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {user.name}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0 ml-1" />}
                      </div>
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                        {user.roleTitle}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
                        {user.department} · {user.nifOrOrderNum}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active User Permissions Matrix */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-neutral-50/50 dark:bg-neutral-950/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Matriz de Permissões de {currentUser.name} ({currentUser.role.toUpperCase()})</span>
              </h3>
              <span className="text-[10px] font-mono text-neutral-500">
                Segurança Baseada em Funções
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(Object.keys(permissionLabels) as Array<keyof UserProfile['permissions']>).map((permKey) => {
                const hasPermission = currentUser.permissions[permKey];
                return (
                  <div
                    key={permKey}
                    className={`p-2 rounded-lg border flex items-center justify-between ${
                      hasPermission
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300'
                        : 'bg-neutral-100/50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    <span>{permissionLabels[permKey]}</span>
                    {hasPermission ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
