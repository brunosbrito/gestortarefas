import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Draggable } from 'react-beautiful-dnd';
import { Activity, AtividadeStatus } from '@/interfaces/AtividadeInterface';
import { Badge } from '@/components/ui/badge';
import { Clock, Upload, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadActivityImage } from '@/services/ActivityImageService';

interface AtividadeCardProps {
  atividade: Activity;
  index: number;
  onStatusChange: (id: number, newStatus: AtividadeStatus) => void;
}

const statusColors = {
  'não iniciada': 'bg-gray-500',
  'em andamento': 'bg-blue-500',
  'concluída': 'bg-green-500',
  'pausada': 'bg-yellow-500',
  'cancelada': 'bg-red-500',
};

export function AtividadeCard({ atividade, index, onStatusChange }: AtividadeCardProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const { toast } = useToast();

  const handleStatusChange = (newStatus: AtividadeStatus) => {
    onStatusChange(atividade.id, newStatus);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsUploadDialogOpen(true);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !imageDescription) {
      toast({
        variant: 'destructive',
        title: 'Erro no upload',
        description: 'Por favor, selecione uma imagem e forneça uma descrição.',
      });
      return;
    }

    try {
      await uploadActivityImage({
        activityId: atividade.id,
        image: selectedFile,
        description: imageDescription
      });
      
      toast({
        title: 'Upload realizado com sucesso',
        description: 'A imagem foi enviada e será processada em breve.',
      });
      
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setImageDescription('');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no upload',
        description: 'Ocorreu um erro ao fazer o upload da imagem. Tente novamente.',
      });
    }
  };

  return (
    <Draggable draggableId={String(atividade.id)} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {atividade.description}
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  {format(new Date(atividade.startDate), "dd 'de' MMMM", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Tarefa Macro</p>
                  <p className="text-sm text-gray-500">{atividade.macroTask}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Processo</p>
                  <p className="text-sm text-gray-500">{atividade.process}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Equipe</p>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {atividade.collaborators?.length || 0} colaboradores
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge
                    className={`${
                      statusColors[atividade.status as keyof typeof statusColors]
                    } text-white`}
                  >
                    {atividade.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('em andamento')}
                >
                  Iniciar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('concluída')}
                >
                  Concluir
                </Button>
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                        id={`upload-image-${atividade.id}`}
                      />
                      <label htmlFor={`upload-image-${atividade.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4" />
                          </span>
                        </Button>
                      </label>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload de Imagem</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="imageDescription">Descrição da Imagem</Label>
                        <Input
                          id="imageDescription"
                          value={imageDescription}
                          onChange={(e) => setImageDescription(e.target.value)}
                          placeholder="Digite uma descrição para a imagem"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={handleImageUpload}
                        className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/90"
                      >
                        Enviar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  Tempo previsto: {atividade.estimatedTime}
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </Draggable>
  );
}