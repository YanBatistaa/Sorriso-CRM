import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettingsTab } from "@/components/settings/GeneralSettingsTab";
import { ProceduresSettingsTab } from "@/components/settings/ProceduresSettingsTab";
import { PersonalizationSettingsTab } from "@/components/settings/PersonalizationSettingsTab";
import { TeamSettingsTab } from "@/components/settings/TeamSettingsTab";

const ClinicSettingsPage = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-semibold">Configurações da Clínica</h1>
            <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-4 max-w-xl">
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    <TabsTrigger value="treatments">Procedimentos</TabsTrigger>
                    <TabsTrigger value="personalization">Personalização</TabsTrigger>
                    <TabsTrigger value="team">Equipa</TabsTrigger>
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
                
                <TabsContent value="team">
                    <TeamSettingsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ClinicSettingsPage;