'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Plus,
  Users,
  UserCheck,
  Shield,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Mail,
  Calendar
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  avatar?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

export default function TeamPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'agent'>('agent');
  const [addSubmitted, setAddSubmitted] = useState(false);
  const [editSubmitted, setEditSubmitted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive' | 'admins' | 'agents'>('all');

  // Mock data - será substituído por dados reais
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresa.com',
      role: 'admin',
      status: 'active',
      lastLogin: 'Há 2 horas',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@empresa.com',
      role: 'agent',
      status: 'active',
      lastLogin: 'Há 30 minutos',
      createdAt: '2024-02-20',
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@empresa.com',
      role: 'agent',
      status: 'active',
      lastLogin: 'Há 1 hora',
      createdAt: '2024-03-10',
    },
    {
      id: '4',
      name: 'Ana Oliveira',
      email: 'ana@empresa.com',
      role: 'agent',
      status: 'inactive',
      lastLogin: 'Há 3 dias',
      createdAt: '2024-01-25',
    },
  ];

  const stats = {
    totalUsers: 4,
    activeUsers: 3,
    admins: 1,
    agents: 3,
  };

  const handleAddMember = () => {
    setAddSubmitted(true);
    if (!name || !email) {
      return;
    }
    console.log('Adicionando membro:', { name, email, role });
    setShowAddModal(false);
    setAddSubmitted(false);
    // Reset form
    setName('');
    setEmail('');
    setRole('agent');
  };

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setEditSubmitted(false);
    setShowEditModal(true);
  };

  const handleEditMember = () => {
    setEditSubmitted(true);
    if (!name || !email) {
      return;
    }
    console.log('Editando membro:', { id: selectedMember?.id, name, email, role });
    setShowEditModal(false);
    setSelectedMember(null);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Shield className="w-3 h-3 mr-1" />
          Administrador
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <UserCheck className="w-3 h-3 mr-1" />
        Vendedor
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Ativo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircle className="w-3 h-3 mr-1" />
        Inativo
      </span>
    );
  };

  const getRolePermissions = (role: string) => {
    if (role === 'admin') {
      return [
        'Acesso total ao sistema',
        'Gerenciar equipe',
        'Criar campanhas',
        'Gerenciar grupos',
        'Ver todas as conversas',
        'Configurações do sistema',
      ];
    }
    return [
      'Ver conversas atribuídas',
      'Responder clientes',
      'Assumir conversas da fila',
    ];
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Equipe</h1>
            <p className="mt-2 text-sm text-gray-600">
              Adicione e gerencie os membros da sua equipe com diferentes níveis de acesso
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Membro
          </button>
        </div>

        {/* Stats Cards (clicáveis como filtros) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            aria-pressed={activeFilter === 'all'}
            className={`text-left bg-white rounded-xl shadow-sm border p-5 transition-colors ${activeFilter === 'all' ? 'border-green-300 ring-2 ring-green-200' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('active')}
            aria-pressed={activeFilter === 'active'}
            className={`text-left bg-white rounded-xl shadow-sm border p-5 transition-colors ${activeFilter === 'active' ? 'border-green-300 ring-2 ring-green-200' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('admins')}
            aria-pressed={activeFilter === 'admins'}
            className={`text-left bg-white rounded-xl shadow-sm border p-5 transition-colors ${activeFilter === 'admins' ? 'border-green-300 ring-2 ring-green-200' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.admins}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('agents')}
            aria-pressed={activeFilter === 'agents'}
            className={`text-left bg-white rounded-xl shadow-sm border p-5 transition-colors ${activeFilter === 'agents' ? 'border-green-300 ring-2 ring-green-200' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendedores</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.agents}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('inactive')}
            aria-pressed={activeFilter === 'inactive'}
            className={`text-left bg-white rounded-xl shadow-sm border p-5 transition-colors ${activeFilter === 'inactive' ? 'border-green-300 ring-2 ring-green-200' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Inativos</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{teamMembers.filter(m => m.status === 'inactive').length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </button>
        </div>

        {/* Permissions Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-purple-800">Permissões do Administrador</h3>
                <ul className="mt-2 text-sm text-purple-700 space-y-1">
                  {getRolePermissions('admin').map((permission, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-2" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Permissões do Vendedor</h3>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  {getRolePermissions('agent').map((permission, idx) => (
                    <li key={idx} className="flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-2" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Membros da Equipe</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Acesso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers
                  .filter((member) => {
                    if (activeFilter === 'all') return true;
                    if (activeFilter === 'active') return member.status === 'active';
                    if (activeFilter === 'inactive') return member.status === 'inactive';
                    if (activeFilter === 'admins') return member.role === 'admin';
                    if (activeFilter === 'agents') return member.role === 'agent';
                    return true;
                  })
                  .map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                            {member.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(member.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {member.lastLogin || 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(member)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setMemberToDelete(member)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={() => setShowAddModal(false)} />
              
              <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Adicionar Membro</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: João Silva"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${addSubmitted && !name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {addSubmitted && !name && (
                      <p className="mt-1 text-xs text-red-600">Campo obrigatório</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="joao@empresa.com"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${addSubmitted && !email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {addSubmitted && !email && (
                      <p className="mt-1 text-xs text-red-600">Campo obrigatório</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'admin' | 'agent')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="agent">Vendedor</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      {role === 'admin' 
                        ? 'Terá acesso total ao sistema' 
                        : 'Poderá apenas atender conversas'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-8">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddMember}
                    className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Member Modal (similar structure) */}
        {showEditModal && selectedMember && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={() => setShowEditModal(false)} />
              
              <div className="relative inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Editar Membro</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${editSubmitted && !name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {editSubmitted && !name && (
                      <p className="mt-1 text-xs text-red-600">Campo obrigatório</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${editSubmitted && !email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {editSubmitted && !email && (
                      <p className="mt-1 text-xs text-red-600">Campo obrigatório</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'admin' | 'agent')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="agent">Vendedor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 mt-8">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEditMember}
                    className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {memberToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={() => setMemberToDelete(null)} />
            <div className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excluir usuário</h3>
              <p className="text-sm text-gray-600">Tem certeza que deseja excluir o usuário <span className="font-medium">{memberToDelete.name}</span>? Essa ação não pode ser desfeita.</p>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setMemberToDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button
                  onClick={() => {
                    // TODO: integrar com serviço backend quando disponível
                    console.log('Excluir usuário:', memberToDelete.id);
                    setMemberToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
