import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/hooks/useAuth';
import { Panel, PanelContent, PanelHeader, PanelTitle, PanelDescription } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { AddMemberDialog } from './AddMemberDialog';

export const TeamSettingsTab = () => {
    const { user } = useAuth();
    const { members, deleteMember, isLoading } = useTeam();
    
    return (
        <Panel>
            <PanelHeader>
                <PanelTitle>Equipe</PanelTitle>
                <PanelDescription>Convide e gira os membros da sua clínica.</PanelDescription>
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
                                    <TableHead>Email</TableHead>
                                    <TableHead>Função</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">Carregando membros...</TableCell></TableRow>
                                ) : (
                                    members.map(member => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">{member.email}</TableCell>
                                            <TableCell><Badge variant="outline">{member.role}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                {member.user_id !== user?.id && (
                                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMember(member.id)}>
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
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