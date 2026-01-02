import { Construction } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EmConstrucaoProps {
  titulo?: string;
  descricao?: string;
}

export const EmConstrucao = ({
  titulo = "Em Construção",
  descricao = "Esta funcionalidade está sendo desenvolvida e estará disponível em breve."
}: EmConstrucaoProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Construction className="w-16 h-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">{titulo}</CardTitle>
          <CardDescription className="text-base mt-2">
            {descricao}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Aguarde as próximas atualizações do sistema.</p>
        </CardContent>
      </Card>
    </div>
  );
};
