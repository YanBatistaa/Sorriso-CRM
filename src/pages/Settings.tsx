import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab";
import { ProceduresSettingsTab } from "@/components/settings/ProceduresSettingsTab";
import { PersonalizationSettingsTab } from "@/components/settings/PersonalizationSettingsTab";
import { TeamSettingsTab } from "@/components/settings/TeamSettingsTab";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";

const ClinicSettingsPage = () => {
    const { role, isLoading } = useCurrentUserRole();

    if (isLoading) {
        return <div className="p-4 text-center">A verificar permissões...</div>;
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-semibold">Configurações da Clínica</h1>
            <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-4 max-w-xl">
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    <TabsTrigger value="treatments">Procedimentos</TabsTrigger>
                    <TabsTrigger value="personalization">Personalização</TabsTrigger>
                    {role === 'admin' && <TabsTrigger value="team">Equipe</TabsTrigger>}
                </TabsList>

                <TabsContent value="general">
                    <GeneralSettingsTab />
                </TabsContent>

                <TabsContent value="treatments">
                    <ProceduresSettingsTab />
                </TabsContent>

                <TabsContent value="personalization">
                    <PersonalizationSettingsTab />
                </TabsContent>
                
                {role === 'admin' && (
                    <TabsContent value="team">
                        <TeamSettingsTab />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};

export default ClinicSettingsPage;