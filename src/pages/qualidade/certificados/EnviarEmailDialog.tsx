import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import CertificadoService from '@/services/CertificadoService';
import { Certificado } from '@/interfaces/QualidadeInterfaces';
import { Mail, Plus, X, FileCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnviarEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificados: Certificado[];
  onSuccess: () => void;
}

export const EnviarEmailDialog = ({
  open,
  onOpenChange,
  certificados,
  onSuccess,
}: EnviarEmailDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [destinatarios, setDestinatarios] = useState<string[]>(['']);
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (open && certificados.length > 0) {
      // Gerar assunto padrão baseado no projeto
      const projeto = certificados[0].project?.name || 'Projeto';
      setAssunto(`Certificados de Qualidade - ${projeto}`);

      // Mensagem padrão
      setMensagem(
        `Prezados,\n\nSegue${certificados.length > 1 ? 'm' : ''} em anexo ${
          certificados.length > 1 ? 'os certificados' : 'o certificado'
        } de qualidade solicitado${certificados.length > 1 ? 's' : ''}.\n\nAtenciosamente,\nEquipe de Qualidade\nGMX Industrial`
      );
    }
  }, [open, certificados]);

  const resetForm = () => {
    setDestinatarios(['']);
    setAssunto('');
    setMensagem('');
  };

  const adicionarDestinatario = () => {
    setDestinatarios([...destinatarios, '']);
  };

  const removerDestinatario = (index: number) => {
    setDestinatarios(destinatarios.filter((_, i) => i !== index));
  };

  const atualizarDestinatario = (index: number, value: string) => {
    const novos = [...destinatarios];
    novos[index] = value;
    setDestinatarios(novos);
  };

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async () => {
    // Validar destinatários
    const destinatariosValidos = destinatarios.filter((d) => d.trim() !== '');

    if (destinatariosValidos.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um destinatário.',
        variant: 'destructive',
      });
      return;
    }

    // Validar formato de email
    const emailsInvalidos = destinatariosValidos.filter((email) => !validarEmail(email));
    if (emailsInvalidos.length > 0) {
      toast({
        title: 'Erro',
        description: `Email${emailsInvalidos.length > 1 ? 's' : ''} inválido${
          emailsInvalidos.length > 1 ? 's' : ''
        }: ${emailsInvalidos.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    if (!assunto.trim()) {
      toast({
        title: 'Erro',
        description: 'O assunto é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!mensagem.trim()) {
      toast({
        title: 'Erro',
        description: 'A mensagem é obrigatória.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const certificadoIds = certificados.map((c) => c.id);

      await CertificadoService.enviarEmail(certificadoIds, {
        destinatarios: destinatariosValidos,
        assunto,
        mensagem,
      });

      toast({
        title: 'Sucesso',
        description: `Email enviado com sucesso para ${destinatariosValidos.length} destinatário${
          destinatariosValidos.length > 1 ? 's' : ''
        }.`,
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o email. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Enviar Certificados por Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Certificados Selecionados */}
          <div className="space-y-2">
            <Label>
              Certificados Selecionados ({certificados.length})
            </Label>
            <div className="border rounded-lg p-4 bg-muted/30 space-y-2 max-h-40 overflow-y-auto">
              {certificados.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center gap-2 text-sm p-2 bg-background rounded"
                >
                  <FileCheck className="w-4 h-4 text-primary" />
                  <span className="flex-1">{cert.tipoCertificado}</span>
                  <Badge variant="outline" className="text-xs">
                    {cert.numeroCertificado}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Destinatários */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Destinatários *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={adicionarDestinatario}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {destinatarios.map((dest, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={dest}
                    onChange={(e) => atualizarDestinatario(index, e.target.value)}
                  />
                  {destinatarios.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerDestinatario(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Adicione os emails dos destinatários que receberão os certificados
            </p>
          </div>

          {/* Assunto */}
          <div className="space-y-2">
            <Label>Assunto *</Label>
            <Input
              placeholder="Assunto do email"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
            />
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <Label>Mensagem *</Label>
            <Textarea
              placeholder="Digite a mensagem do email..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Os certificados serão anexados automaticamente ao email
            </p>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4 bg-muted/30 space-y-2">
            <div className="text-xs font-medium text-muted-foreground">
              PREVIEW DO EMAIL
            </div>
            <div className="text-sm space-y-1">
              <div>
                <span className="font-medium">Para:</span>{' '}
                {destinatarios.filter((d) => d.trim() !== '').join(', ') || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Assunto:</span> {assunto || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Anexos:</span> {certificados.length}{' '}
                arquivo{certificados.length > 1 ? 's' : ''}
              </div>
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
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Enviando...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Enviar Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
