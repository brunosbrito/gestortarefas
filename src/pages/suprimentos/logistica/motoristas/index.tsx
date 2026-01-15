// Página de Listagem de Motoristas - Logística
import { useState, useEffect } from 'react';
import driversService from '@/services/suprimentos/logistica/driversService';
import { Driver } from '@/interfaces/suprimentos/logistica/DriverInterface';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function MotoristasPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const response = await driversService.getAll();
      if (response.success) {
        setDrivers(response.data.drivers);
      }
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(
    (d) =>
      d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.cpf.includes(searchTerm) ||
      d.cnh_numero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Driver['status']) => {
    const statusConfig = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      inativo: { label: 'Inativo', variant: 'secondary' as const },
      ferias: { label: 'Férias', variant: 'outline' as const },
      afastado: { label: 'Afastado', variant: 'destructive' as const },
    };
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Motoristas</h1>
          <p className="text-muted-foreground">Gerencie os motoristas da empresa</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Motorista
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CPF ou CNH..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>CNH</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Validade CNH</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Nenhum motorista encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-semibold">{driver.nome}</TableCell>
                  <TableCell className="font-mono">{driver.cpf}</TableCell>
                  <TableCell className="font-mono">{driver.cnh_numero}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{driver.cnh_categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(driver.cnh_validade).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>{driver.telefone}</TableCell>
                  <TableCell>{getStatusBadge(driver.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Mostrando {filteredDrivers.length} de {drivers.length} motoristas
      </div>
    </div>
  );
}
