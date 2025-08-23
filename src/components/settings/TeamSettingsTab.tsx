import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/hooks/useAuth';
import { Panel, PanelContent, PanelHeader, PanelTitle, PanelDescription } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { AddMemberDialog } from './AddMemberDialog';
import { EditMemberDialog } from './EditMemberDialog'; // Importar o novo modal de edição

export const TeamSettingsTab = () => {
    const { user } = useAuth();
    const { members, deleteMember, isLoading } = useTeam();
    
    return (
        <Panel>
            <PanelHeader>
                <PanelTitle>Equipe</PanelTitle>
                <PanelDescription>Adicione e gira os membros da sua clínica.</PanelDescription>
            </PanelHeader>
            <PanelContent className="space-y-6">
                <div className="flex justify-end">
                    <AddMemberDialog />
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold">Membros Atuais</h3>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Função</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={4} className="text-center h-24">Carregando equipe...</TableCell></TableRow>
                                ) : (
                                    members.map(member => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">{member.full_name || 'Nome não definido'}</TableCell>
                                            <TableCell className="text-muted-foreground">{member.email}</TableCell>
                                            <TableCell><Badge variant="outline">{member.role}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                {member.user_id !== user?.id && (
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Usar o novo componente de edição */}
                                                        <EditMemberDialog member={member} />
                                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMember(member.id)}>
                                                            <Trash2 className="h-4 w-4"/>
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </PanelContent>
        </Panel>
    );
};