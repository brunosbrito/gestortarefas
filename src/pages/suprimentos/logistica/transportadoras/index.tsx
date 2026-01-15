// Página de Listagem de Transportadoras - Logística
import { useState, useEffect } from 'react';
import transportadorasService from '@/services/suprimentos/logistica/transportadorasService';
import { Transportadora } from '@/interfaces/suprimentos/logistica/TransportInterface';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Search, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TransportadorasPage() {
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTransportadoras();
  }, []);

  const loadTransportadoras = async () => {
    try {
      setLoading(true);
      const response = await transportadorasService.getAll();
      if (response.success) {
        setTransportadoras(response.data.transportadoras);
      }
    } catch (error) {
      console.error('Erro ao carregar transportadoras:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransportadoras = transportadoras.filter(
    (t) =>
      t.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cnpj.includes(searchTerm)
  );

  const renderStars = (rating: number | undefined) => {
    if (!rating) return <span className="text-muted-foreground text-sm">Sem avaliação</span>;

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
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
          <h1 className="text-3xl font-bold">Transportadoras</h1>
          <p className="text-muted-foreground">
            Gerencie as empresas de transporte parceiras
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transportadora
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por razão social ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razão Social</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransportadoras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhuma transportadora encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredTransportadoras.map((transportadora) => (
                <TableRow key={transportadora.id}>
                  <TableCell className="font-semibold">
                    {transportadora.razao_social}
                  </TableCell>
                  <TableCell className="font-mono">{transportadora.cnpj}</TableCell>
                  <TableCell>{transportadora.telefone}</TableCell>
                  <TableCell>{transportadora.email || '-'}</TableCell>
                  <TableCell>{renderStars(transportadora.rating)}</TableCell>
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
        Mostrando {filteredTransportadoras.length} de {transportadoras.length}{' '}
        transportadoras
      </div>
    </div>
  );
}
