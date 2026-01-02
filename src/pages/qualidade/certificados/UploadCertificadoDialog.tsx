import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import CertificadoService from '@/services/CertificadoService';
import ObrasService from '@/services/ObrasService';
import { Obra } from '@/interfaces/ObrasInterface';
import { Upload, FileCheck } from 'lucide-react';

interface UploadCertificadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const UploadCertificadoDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: UploadCertificadoDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [projetos, setProjetos] = useState<Obra[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    tipoCertificado: '',
    numeroCertificado: '',
    fornecedor: '',
    laboratorio: '',
    projectId: '',
    material: '',
    lote: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    dataValidade: '',
  });

  useEffect(() => {
    if (open) {
      getProjetos();
    }
  }, [open]);

  const getProjetos = async () => {
    try {
      const data = await ObrasService.getAllObras();
      setProjetos(data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      tipoCertificado: '',
      numeroCertificado: '',
      fornecedor: '',
      laboratorio: '',
      projectId: '',
      material: '',
      lote: '',
      dataEmissao: new Date().toISOString().split('T')[0],
      dataValidade: '',
    });
    setArquivo(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 10MB.',
          variant: 'destructive',
        });
        return;
      }

      // Validar tipo
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Tipo de arquivo inválido',
          description: 'Apenas PDF, JPG e PNG são permitidos.',
          variant: 'destructive',
        });
        return;
      }

      setArquivo(file);
    }
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleClickUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleSubmit = async () => {
    if (!formData.tipoCertificado.trim()) {
      toast({
        title: 'Erro',
        description: 'O tipo de certificado é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.numeroCertificado.trim()) {
      toast({
        title: 'Erro',
        description: 'O número do certificado é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.fornecedor.trim()) {
      toast({
        title: 'Erro',
        description: 'O fornecedor é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.projectId) {
      toast({
        title: 'Erro',
        description: 'Selecione uma obra.',
        variant: 'destructive',
      });
      return;
    }

    if (!arquivo) {
      toast({
        title: 'Erro',
        description: 'Selecione um arquivo para upload.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      // Upload do arquivo
      const formDataFile = new FormData();
      formDataFile.append('file', arquivo);

      const uploadResult = await CertificadoService.uploadFile(formDataFile);

      // Criar o certificado com os dados + arquivo
      const certificadoData = {
        ...formData,
        arquivoUrl: uploadResult.arquivoUrl,
        nomeArquivo: uploadResult.nomeArquivo,
        tipoArquivo: uploadResult.tipoArquivo,
        status: 'recebido',
      };

      await CertificadoService.create(certificadoData);

      toast({
        title: 'Sucesso',
        description: 'Certificado enviado com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer o upload do certificado.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Certificado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Certificado *</Label>
              <Input
                placeholder="Ex: Certificado de Aço, Laudo de Ensaio, etc."
                value={formData.tipoCertificado}
                onChange={(e) =>
                  setFormData({ ...formData, tipoCertificado: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Número do Certificado *</Label>
              <Input
                placeholder="Ex: CERT-2024-001"
                value={formData.numeroCertificado}
                onChange={(e) =>
                  setFormData({ ...formData, numeroCertificado: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Fornecedor *</Label>
              <Input
                placeholder="Nome do fornecedor/laboratório"
                value={formData.fornecedor}
                onChange={(e) =>
                  setFormData({ ...formData, fornecedor: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Laboratório</Label>
              <Input
                placeholder="Nome do laboratório (se aplicável)"
                value={formData.laboratorio}
                onChange={(e) =>
                  setFormData({ ...formData, laboratorio: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Obra/Projeto *</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) =>
                  setFormData({ ...formData, projectId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
                <SelectContent>
                  {projetos.map((projeto) => (
                    <SelectItem key={projeto.id} value={projeto.id}>
                      {projeto.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Material/Item</Label>
              <Input
                placeholder="Ex: Aço CA-50"
                value={formData.material}
                onChange={(e) =>
                  setFormData({ ...formData, material: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Lote</Label>
              <Input
                placeholder="Número do lote"
                value={formData.lote}
                onChange={(e) =>
                  setFormData({ ...formData, lote: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Emissão *</Label>
              <Input
                type="date"
                value={formData.dataEmissao}
                onChange={(e) =>
                  setFormData({ ...formData, dataEmissao: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Validade</Label>
              <Input
                type="date"
                value={formData.dataValidade}
                onChange={(e) =>
                  setFormData({ ...formData, dataValidade: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Arquivo do Certificado *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <FileCheck className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <span className="text-primary font-medium">
                      Clique para selecionar
                    </span>
                    <span className="text-muted-foreground"> ou arraste o arquivo</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG ou PNG (máx. 10MB)
                  </p>
                </div>
              </label>
              {arquivo && (
                <div className="mt-4 p-3 bg-muted rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{arquivo.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {uploading ? 'Enviando...' : 'Upload Certificado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
