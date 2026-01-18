import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Cliente, CreateCliente } from '@/interfaces/ClienteInterface';
import ClienteService from '@/services/ClienteService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ClienteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
  onSaveSuccess: () => void;
}

const ClienteFormDialog = ({
  open,
  onOpenChange,
  cliente,
  onSaveSuccess,
}: ClienteFormDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateCliente>({
    razaoSocial: cliente?.razaoSocial || '',
    nomeFantasia: cliente?.nomeFantasia || '',
    tipoPessoa: cliente?.tipoPessoa || 'juridica',
    cnpj: cliente?.cnpj || '',
    cpf: cliente?.cpf || '',
    telefone: cliente?.telefone || '',
    email: cliente?.email || '',
    enderecoPrincipal: cliente?.enderecoPrincipal || {
      tipo: 'sede',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: '',
      pais: 'Brasil',
      principal: true,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.razaoSocial || !formData.telefone || !formData.email) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (formData.tipoPessoa === 'juridica' && !formData.cnpj) {
      toast({
        title: 'Erro',
        description: 'CNPJ é obrigatório para pessoa jurídica',
        variant: 'destructive',
      });
      return;
    }

    if (formData.tipoPessoa === 'fisica' && !formData.cpf) {
      toast({
        title: 'Erro',
        description: 'CPF é obrigatório para pessoa física',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      if (cliente) {
        await ClienteService.update(cliente.id, formData);
        toast({
          title: 'Sucesso',
          description: 'Cliente atualizado com sucesso',
        });
      } else {
        await ClienteService.create(formData);
        toast({
          title: 'Sucesso',
          description: 'Cliente criado com sucesso',
        });
      }

      onSaveSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar cliente',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Pessoa */}
          <div className="space-y-2">
            <Label htmlFor="tipoPessoa">Tipo de Pessoa *</Label>
            <Select
              value={formData.tipoPessoa}
              onValueChange={(value: 'juridica' | 'fisica') =>
                setFormData({ ...formData, tipoPessoa: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                <SelectItem value="fisica">Pessoa Física</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Razão Social / Nome */}
          <div className="space-y-2">
            <Label htmlFor="razaoSocial">
              {formData.tipoPessoa === 'juridica' ? 'Razão Social' : 'Nome Completo'} *
            </Label>
            <Input
              id="razaoSocial"
              value={formData.razaoSocial}
              onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
              placeholder={
                formData.tipoPessoa === 'juridica' ? 'Razão social da empresa' : 'Nome completo'
              }
              required
            />
          </div>

          {/* Nome Fantasia (apenas PJ) */}
          {formData.tipoPessoa === 'juridica' && (
            <div className="space-y-2">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input
                id="nomeFantasia"
                value={formData.nomeFantasia || ''}
                onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                placeholder="Nome fantasia da empresa"
              />
            </div>
          )}

          {/* CNPJ ou CPF */}
          <div className="grid grid-cols-2 gap-4">
            {formData.tipoPessoa === 'juridica' ? (
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj || ''}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf || ''}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              required
            />
          </div>

          {/* Endereço */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Endereço Principal</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.enderecoPrincipal.cep}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enderecoPrincipal: { ...formData.enderecoPrincipal, cep: e.target.value },
                      })
                    }
                    placeholder="00000-000"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={formData.enderecoPrincipal.logradouro}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enderecoPrincipal: {
                          ...formData.enderecoPrincipal,
                          logradouro: e.target.value,
                        },
                      })
                    }
                    placeholder="Rua, Avenida, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={formData.enderecoPrincipal.numero}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enderecoPrincipal: {
                          ...formData.enderecoPrincipal,
                          numero: e.target.value,
                        },
                      })
                    }
                    placeholder="123"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.enderecoPrincipal.bairro}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enderecoPrincipal: {
                          ...formData.enderecoPrincipal,
                          bairro: e.target.value,
                        },
                      })
                    }
                    placeholder="Centro, Vila, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.enderecoPrincipal.cidade}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enderecoPrincipal: {
                          ...formData.enderecoPrincipal,
                          cidade: e.target.value,
                        },
                      })
                    }
                    placeholder="São Paulo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uf">UF</Label>
                  <Input
                    id="uf"
                    value={formData.enderecoPrincipal.uf}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enderecoPrincipal: { ...formData.enderecoPrincipal, uf: e.target.value },
                      })
                    }
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cliente ? 'Atualizar' : 'Criar'} Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteFormDialog;
